import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import CompanyDetails from "../../models/company_Models/companydetails.js";
import User from "../../models/userModel.js";
import { VendorDetails } from "../../models/VendorModel.js";
import { emailQueue } from "../../queues/emailQueue.js";

const vendorFields = [
  "name",
  "email",
  "phone_number",
  "address",
  "contact_person_name",
  "contact_person_email",
  "contact_person_phone_number",
  "contact_person_designation",
];

const sortFields = new Set([
  ...vendorFields,
  "status",
  "createdAt",
  "updatedAt",
]);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInteger = (value, fallback, maximum) => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0
    ? Math.min(parsed, maximum)
    : null;
};

const validateVendorFields = (data = {}, required = false) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Request body must be an object.";
  }

  for (const field of vendorFields) {
    if (required || data[field] !== undefined) {
      if (typeof data[field] !== "string" || !data[field].trim()) {
        return `${field} is required and must be a non-empty string`;
      }
    }
  }

  if (
    data.email !== undefined &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
  ) {
    return "A valid vendor email is required";
  }

  if (
    data.contact_person_email !== undefined &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_person_email.trim())
  ) {
    return "A valid contact person email is required";
  }

  return null;
};

const normalizeVendorFields = (data) =>
  Object.fromEntries(
    vendorFields
      .filter((field) => data[field] !== undefined)
      .map((field) => [
        field,
        field.endsWith("_email") || field === "email"
          ? data[field].trim().toLowerCase()
          : data[field].trim(),
      ]),
  );

export const addVendor = async (req, res) => {
  try {
    const validationError = validateVendorFields(req.body, true);
    if (validationError) {
      return res.status(422).json({ success: false, message: validationError });
    }

    const vendorData = normalizeVendorFields(req.body);
    const normalizedEmail = vendorData.email;
    const escapedEmail = escapeRegex(normalizedEmail);
    let vendorUser = await User.findOne({
      email: { $regex: `^${escapedEmail}$`, $options: "i" },
    });
    let isNewAccount = false;
    let password;

    if (vendorUser) {
      if (vendorUser.role !== 4) {
        return res.status(409).json({
          success: false,
          message:
            "This email is already associated with a non-vendor account.",
        });
      }
      if (vendorUser.is_del || vendorUser.is_active === false) {
        return res.status(409).json({
          success: false,
          message: "This vendor account is inactive.",
        });
      }
    } else {
      password = randomBytes(18).toString("base64url");
      vendorUser = await User.create({
        name: vendorData.name,
        email: normalizedEmail,
        password: await bcrypt.hash(password, 10),
        role: 4,
        self_registered: 0,
      });
      isNewAccount = true;
    }

    const existingAssociation = await VendorDetails.findOne({
      employerId: req.userId,
      userId: vendorUser._id,
    });

    if (existingAssociation && !existingAssociation.is_del) {
      return res.status(409).json({
        success: false,
        message: "This vendor is already associated with your company.",
      });
    }

    const company = await CompanyDetails.findOne({
      userId: req.userId,
      isDel: false,
    }).lean();
    const companyUser = await User.findById(req.userId).select("name").lean();
    const companyName = company?.name || companyUser?.name || "Your company";

    let vendor;
    if (existingAssociation) {
      Object.assign(existingAssociation, vendorData, {
        is_del: false,
        status: true,
      });
      vendor = await existingAssociation.save();
    } else {
      vendor = await VendorDetails.create({
        ...vendorData,
        userId: vendorUser._id,
        employerId: req.userId,
      });
    }

    if (isNewAccount) {
      const token = jwt.sign(
        { userId: vendorUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "30d" },
      );
      await emailQueue.add("user_credentials_email", {
        name: vendorUser.name,
        email: vendorUser.email,
        password,
        token,
      });
      await emailQueue.add("vendor_association_notice", {
        name: vendorUser.name,
        email: vendorUser.email,
        companyName,
      });
    } else {
      await emailQueue.add("vendor_association_notice", {
        name: vendorUser.name,
        email: vendorUser.email,
        companyName,
      });
    }

    return res.status(isNewAccount ? 201 : 200).json({
      success: true,
      message: isNewAccount
        ? "Vendor added and login details sent."
        : "Vendor added and association notification sent.",
      data: vendor,
    });
  } catch (error) {
    console.error("Add vendor error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to add vendor." });
  }
};

export const listVendors = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1, 1_000_000);
    const limit = parsePositiveInteger(req.query.limit, 10, 100);
    const sort = req.query.sort || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";

    if (!page || !limit) {
      return res.status(422).json({
        success: false,
        message: "page and limit must be positive integers.",
      });
    }
    if (!sortFields.has(sort)) {
      return res.status(422).json({
        success: false,
        message: "Invalid sort field.",
      });
    }
    if (!["asc", "desc"].includes(sortOrder)) {
      return res.status(422).json({
        success: false,
        message: "sortOrder must be asc or desc.",
      });
    }
    /*    if (
      req.query.status !== undefined &&
      !["true", "false"].includes(req.query.status)
    ) {
      return res.status(422).json({
        success: false,
        message: "status must be true or false.",
      });
    } */

    const filter = {
      employerId: req.userId,
      is_del: false,
    };
    /*     if (req.query.status !== undefined) {
      filter.status = req.query.status === "true";
    } */
    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const search = new RegExp(escapeRegex(req.query.search.trim()), "i");
      filter.$or = [...vendorFields.map((field) => ({ [field]: search }))];
    }

    const [vendors, total] = await Promise.all([
      VendorDetails.find(filter)
        .sort({ [sort]: sortOrder === "asc" ? 1 : -1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      VendorDetails.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: vendors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List vendors error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to fetch vendors." });
  }
};

export const getVendor = async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res
        .status(422)
        .json({ success: false, message: "Invalid vendor id." });
    }

    const vendor = await VendorDetails.findOne({
      _id: req.params.id,
      employerId: req.userId,
      is_del: false,
    }).lean();

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found." });
    }

    return res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    console.error("Get vendor error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to fetch vendor." });
  }
};

export const updateVendor = async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res
        .status(422)
        .json({ success: false, message: "Invalid vendor id." });
    }

    const vendor = await VendorDetails.findOne({
      _id: req.params.id,
      employerId: req.userId,
      is_del: false,
    });
    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found." });
    }

    const body = req.body || {};
    const validationError = validateVendorFields(body);
    if (validationError) {
      return res.status(422).json({ success: false, message: validationError });
    }

    const updates = normalizeVendorFields(body);
    if (body.status !== undefined) {
      if (typeof body.status !== "boolean") {
        return res.status(422).json({
          success: false,
          message: "status must be a boolean.",
        });
      }
      updates.status = body.status;
    }
    if (!Object.keys(updates).length) {
      return res.status(422).json({
        success: false,
        message: "Provide at least one valid vendor field to update.",
      });
    }

    const sharedIdentityUpdates = {};
    if (updates.name) sharedIdentityUpdates.name = updates.name;
    if (updates.email) sharedIdentityUpdates.email = updates.email;

    if (updates.email) {
      const escapedEmail = escapeRegex(updates.email);
      const emailInUse = await User.findOne({
        _id: { $ne: vendor.userId },
        email: { $regex: `^${escapedEmail}$`, $options: "i" },
      }).select("_id");
      if (emailInUse) {
        return res.status(409).json({
          success: false,
          message: "This email is already associated with another account.",
        });
      }
    }

    if (Object.keys(sharedIdentityUpdates).length) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: vendor.userId, role: 4 },
        { $set: sharedIdentityUpdates },
        { new: true, runValidators: true },
      );
      if (!updatedUser) {
        return res.status(409).json({
          success: false,
          message: "The linked vendor account could not be updated.",
        });
      }
      await VendorDetails.updateMany(
        { userId: vendor.userId },
        { $set: sharedIdentityUpdates },
      );
    }

    Object.assign(vendor, updates);
    await vendor.save();
    return res.status(200).json({
      success: true,
      message: "Vendor updated successfully.",
      data: vendor,
    });
  } catch (error) {
    console.error("Update vendor error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to update vendor." });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res
        .status(422)
        .json({ success: false, message: "Invalid vendor id." });
    }

    const vendor = await VendorDetails.findOneAndUpdate(
      {
        _id: req.params.id,
        employerId: req.userId,
        is_del: false,
      },
      { $set: { is_del: true } },
      { new: true },
    );
    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor removed from your company.",
    });
  } catch (error) {
    console.error("Delete vendor error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to delete vendor." });
  }
};
