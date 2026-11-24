import cloudinary from "../../config/cloudinary.js";
import {
  VendorCandidates,
  VendorSubmitRequest,
  VendorSendCandidate as VendorSendCandidateModel,
} from "../../models/VendorModel.js";
import CompanyDetails from "../../models/company_Models/companydetails.js";
import User from "../../models/userModel.js";
import CandidateDetails from "../../models/CandidateDetailsModel.js";
import personalDetails from "../../models/personalDetails.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import { emailQueue } from "../../queues/emailQueue.js";
import mongoose from "mongoose";
const candidateFields = ["name", "email", "phone_number"];
const candidateSearchFields = ["name", "email", "phone_number"];
const sortFields = new Set([
  ...candidateSearchFields,
  "status",
  "createdAt",
  "updatedAt",
]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInteger = (value, fallback, maximum) => {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0
    ? Math.min(parsed, maximum)
    : null;
};

const validateCandidateFields = (data, required = false) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Request body must be an object.";
  }

  for (const field of candidateFields) {
    if (required || data[field] !== undefined) {
      if (typeof data[field] !== "string" || !data[field].trim()) {
        return `${field} is required and must be a non-empty string.`;
      }
    }
  }

  if (data.email !== undefined && !emailPattern.test(data.email.trim())) {
    return "A valid email is required.";
  }

  return null;
};

const normalizeCandidateFields = (data) =>
  Object.fromEntries(
    candidateFields
      .filter((field) => data[field] !== undefined)
      .map((field) => [
        field,
        field === "email"
          ? data[field].trim().toLowerCase()
          : data[field].trim(),
      ]),
  );

const parseStatus = (value) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
};

const uploadCandidateCv = (file) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "e2score/vendor_candidate_cvs",
          resource_type: "raw",
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result?.secure_url || !result.public_id) {
            return reject(
              new Error("Cloudinary returned an incomplete upload result."),
            );
          }
          resolve({
            cv: result.secure_url,
            cvPublicId: result.public_id,
          });
        },
      )
      .end(file.buffer);
  });

const destroyCandidateCv = async (publicId) => {
  if (!publicId) return null;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });
    return null;
  } catch (error) {
    console.error("Vendor candidate CV cleanup error:", error);
    return error;
  }
};

const rollbackUploadedCv = async (uploadedCv) => {
  if (!uploadedCv?.cvPublicId) return;
  const cleanupError = await destroyCandidateCv(uploadedCv.cvPublicId);
  if (cleanupError) {
    console.error(
      "Unable to remove a candidate CV after a failed database operation.",
    );
  }
};

export const addCandidate = async (req, res) => {
  let uploadedCv;
  try {
    const body = req.body || {};
    const validationError = validateCandidateFields(body, true);
    if (validationError) {
      return res.status(422).json({ success: false, message: validationError });
    }
    if (!req.file) {
      return res
        .status(422)
        .json({ success: false, message: "A PDF CV upload is required." });
    }

    const candidateData = normalizeCandidateFields(body);
    if (body.status !== undefined) {
      const status = parseStatus(body.status);
      if (status === null) {
        return res
          .status(422)
          .json({ success: false, message: "status must be true or false." });
      }
      candidateData.status = status;
    }

    uploadedCv = await uploadCandidateCv(req.file);

    const escapedEmail = escapeRegex(candidateData.email);
    let candidateUser = await User.findOne({
      email: { $regex: `^${escapedEmail}$`, $options: "i" },
    });
    let newAccountPassword;

    const existingVendorCandidate = await VendorCandidates.findOne({
      VendorId: req.userId,
      email: { $regex: `^${escapedEmail}$`, $options: "i" },
    });
    if (existingVendorCandidate) {
      await rollbackUploadedCv(uploadedCv);

      return res.status(409).json({
        success: false,
        message:
          "This candidate has already been added by your vendor account.",
      });
    }

    if (candidateUser) {
      if (candidateUser.role !== 1) {
        await rollbackUploadedCv(uploadedCv);
        return res.status(409).json({
          success: false,
          message:
            "This email is already associated with a non-candidate account.",
        });
      }
      if (candidateUser.is_del || candidateUser.is_active === false) {
        await rollbackUploadedCv(uploadedCv);
        return res.status(409).json({
          success: false,
          message: "This candidate account is inactive.",
        });
      }
    } else {
      newAccountPassword = randomBytes(18).toString("base64url");
      candidateUser = await User.create({
        name: candidateData.name,
        email: candidateData.email,
        password: await bcrypt.hash(newAccountPassword, 10),
        phone_number: candidateData.phone_number,
        role: 1,
        self_registered: 0,
      });

      await Promise.all([
        CandidateDetails.updateOne(
          { userId: candidateUser._id },
          { $setOnInsert: { userId: candidateUser._id } },
          { upsert: true },
        ),
        personalDetails.updateOne(
          { user: candidateUser._id },
          {
            $setOnInsert: {
              user: candidateUser._id,
              visibility: { openToWork: true, showProfileInSearch: true },
            },
          },
          { upsert: true },
        ),
      ]);
    }

    const candidate = await VendorCandidates.create({
      ...candidateData,
      ...uploadedCv,
      VendorId: req.userId,
      CandidateId: candidateUser._id,
    });

    const vendorUser = await User.findById(req.userId).select("name").lean();
    const vendorName = vendorUser?.name || "Your vendor";

    if (newAccountPassword) {
      const verificationToken = jwt.sign(
        { userId: candidateUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "30d" },
      );
      await emailQueue.add("candidate_registration", {
        name: candidateUser.name,
        email: candidateUser.email,
        password: newAccountPassword,
        token: verificationToken,
      });
    }

    await emailQueue.add("vendor_candidate_notice", {
      name: candidateUser.name,
      email: candidateUser.email,
      vendorName,
    });

    return res.status(201).json({
      success: true,
      message: newAccountPassword
        ? "Candidate registered and login details sent."
        : "Candidate added and notification sent.",
      data: candidate,
    });
  } catch (error) {
    console.error("Add vendor candidate error:", error);
    await rollbackUploadedCv(uploadedCv);
    return res
      .status(500)
      .json({ success: false, message: "Unable to add candidate." });
  }
};

export const listCandidates = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1, 1_000_000);
    const limit = parsePositiveInteger(req.query.limit, 10, 100);
    const sort = req.query.sort || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";

    /*     if (!page || !limit) {
      return res.status(422).json({
        success: false,
        message: "page and limit must be positive integers.",
      });
    } */
    if (typeof sort !== "string" || !sortFields.has(sort)) {
      return res
        .status(422)
        .json({ success: false, message: "Invalid sort field." });
    }
    if (typeof sortOrder !== "string" || !["asc", "desc"].includes(sortOrder)) {
      return res
        .status(422)
        .json({ success: false, message: "sortOrder must be asc or desc." });
    }

    const filter = {
      VendorId: req.userId,
      is_del: false,
    };
    if (req.query.search !== undefined) {
      if (
        typeof req.query.search !== "string" ||
        req.query.search.length > 100
      ) {
        return res.status(422).json({
          success: false,
          message: "search must be a string no longer than 100 characters.",
        });
      }
      if (req.query.search.trim()) {
        const search = new RegExp(escapeRegex(req.query.search.trim()), "i");
        filter.$or = candidateSearchFields.map((field) => ({
          [field]: search,
        }));
      }
    }

    const [candidates, total] = await Promise.all([
      VendorCandidates.find(filter)
        .sort({ [sort]: sortOrder === "asc" ? 1 : -1, _id: 1 })
        .skip(limit === 0 ? 0 : (page - 1) * limit)
        .limit(limit)
        .lean(),
      VendorCandidates.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: candidates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List vendor candidates error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to fetch candidates." });
  }
};

export const getCandidate = async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res
        .status(422)
        .json({ success: false, message: "Invalid candidate id." });
    }

    const candidate = await VendorCandidates.findOne({
      _id: req.params.id,
      VendorId: req.userId,
      is_del: false,
    }).lean();
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found." });
    }

    return res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    console.error("Get vendor candidate error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to fetch candidate." });
  }
};

export const updateCandidate = async (req, res) => {
  let uploadedCv;
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res
        .status(422)
        .json({ success: false, message: "Invalid candidate id." });
    }

    const candidate = await VendorCandidates.findOne({
      _id: req.params.id,
      VendorId: req.userId,
      is_del: false,
    });
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found." });
    }

    const body = req.body || {};
    const validationError = validateCandidateFields(body);
    if (validationError) {
      return res.status(422).json({ success: false, message: validationError });
    }

    const updates = normalizeCandidateFields(body);
    if (body.status !== undefined) {
      const status = parseStatus(body.status);
      if (status === null) {
        return res
          .status(422)
          .json({ success: false, message: "status must be true or false." });
      }
      updates.status = status;
    }
    if (!Object.keys(updates).length && !req.file) {
      return res.status(422).json({
        success: false,
        message: "Provide at least one candidate field or a PDF CV to update.",
      });
    }

    if (req.file) uploadedCv = await uploadCandidateCv(req.file);
    const oldCvPublicId = candidate.cvPublicId;
    Object.assign(candidate, updates, uploadedCv);
    await candidate.save();

    const cleanupError = uploadedCv
      ? await destroyCandidateCv(oldCvPublicId)
      : null;
    return res.status(200).json({
      success: true,
      message: cleanupError
        ? "Candidate updated, but the previous CV could not be removed."
        : "Candidate updated successfully.",
      ...(cleanupError
        ? { cleanupWarning: "Previous CV cleanup failed." }
        : {}),
      data: candidate,
    });
  } catch (error) {
    console.error("Update vendor candidate error:", error);
    await rollbackUploadedCv(uploadedCv);
    return res
      .status(500)
      .json({ success: false, message: "Unable to update candidate." });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res
        .status(422)
        .json({ success: false, message: "Invalid candidate id." });
    }

    const candidate = await VendorCandidates.findOneAndUpdate(
      {
        _id: req.params.id,
        VendorId: req.userId,
        is_del: false,
      },
      { $set: { is_del: true } },
      { new: true },
    );
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found." });
    }

    const cleanupError = await destroyCandidateCv(candidate.cvPublicId);
    return res.status(200).json({
      success: true,
      message: cleanupError
        ? "Candidate removed, but the CV could not be deleted."
        : "Candidate removed successfully.",
      ...(cleanupError ? { cleanupWarning: "CV cleanup failed." } : {}),
    });
  } catch (error) {
    console.error("Delete vendor candidate error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to delete candidate." });
  }
};

export const VendorSendCandidate = async (req, res) => {
  const body = req.body || {};
  const requiredIds = [
    "submitRequestId",
    "jobId",
    "VendorId",
    "VendorDetailsId",
    "employerId",
  ];

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    requiredIds.some(
      (field) =>
        typeof body[field] !== "string" ||
        !mongoose.isValidObjectId(body[field]),
    ) ||
    typeof body.requestId !== "string" ||
    !body.requestId.trim() ||
    !Array.isArray(body.candidate_ids) ||
    body.candidate_ids.length === 0 ||
    body.candidate_ids.some(
      (candidateId) =>
        typeof candidateId !== "string" ||
        !mongoose.isValidObjectId(candidateId),
    )
  ) {
    return res.status(422).json({
      success: false,
      message: "A valid submit request and candidate_ids array are required.",
    });
  }

  if (String(req.userId) !== body.VendorId) {
    return res.status(403).json({
      success: false,
      message: "VendorId must match the authenticated vendor.",
    });
  }

  const candidateIds = [
    ...new Set(
      body.candidate_ids.map((candidateId) => candidateId.toLowerCase()),
    ),
  ];

  const vendorId = new mongoose.Types.ObjectId(body.VendorId);
  const jobId = new mongoose.Types.ObjectId(body.jobId);
  const employerId = new mongoose.Types.ObjectId(body.employerId);
  const vendorDetailsId = new mongoose.Types.ObjectId(body.VendorDetailsId);
  const submitRequestId = new mongoose.Types.ObjectId(body.submitRequestId);

  try {
    let responseData;
    let notificationData;

    const submitRequest = await VendorSubmitRequest.findOne({
      _id: submitRequestId,
      requestId: body.requestId.trim(),
      VendorId: vendorId,
      VendorDetailsId: vendorDetailsId,
      jobId,
      employerId,
      is_del: false,
    });

    if (!submitRequest) {
      const error = new Error("Submit request not found.");
      error.statusCode = 404;
      throw error;
    }

    const candidateObjectIds = candidateIds.map(
      (candidateId) => new mongoose.Types.ObjectId(candidateId),
    );

    const ownedCandidates = await VendorCandidates.find(
      {
        VendorId: vendorId,
        CandidateId: { $in: candidateObjectIds },
        is_del: false,
        status: true,
      },
      { CandidateId: 1 },
    ).lean();

    const ownedCandidateIds = new Set(
      ownedCandidates.map((candidate) => String(candidate.CandidateId)),
    );

    if (
      candidateIds.some((candidateId) => !ownedCandidateIds.has(candidateId))
    ) {
      const error = new Error(
        "One or more candidates are not active candidates of this vendor.",
      );
      error.statusCode = 403;
      throw error;
    }

    const previouslyShared = await VendorSendCandidateModel.find(
      {
        VendorId: vendorId,
        jobId,
        CandidateId: { $in: candidateObjectIds },
      },
      { CandidateId: 1 },
    ).lean();

    const previouslySharedIds = new Set(
      previouslyShared.map((candidate) => String(candidate.CandidateId)),
    );

    const newCandidateIds = candidateObjectIds.filter(
      (candidateId) => !previouslySharedIds.has(String(candidateId)),
    );

    if (newCandidateIds.length === 0) {
      responseData = {
        addedCount: 0,
        sharedCandidate: submitRequest.sharedCandidate || 0,
        candidateCount: submitRequest.candidateCount,
      };
    } else {
      const candidateUsers = await User.find(
        { _id: { $in: newCandidateIds } },
        { name: 1, email: 1 },
      ).lean();

      const candidateUsersById = new Map(
        candidateUsers.map((candidate) => [String(candidate._id), candidate]),
      );

      if (
        newCandidateIds.some(
          (candidateId) => !candidateUsersById.get(String(candidateId))?.email,
        )
      ) {
        const error = new Error(
          "Candidate email details are unavailable for one or more candidates.",
        );
        error.statusCode = 422;
        throw error;
      }

      const employerUser = await User.findById(employerId)
        .select("name email")
        .lean();

      if (!employerUser?.email) {
        const error = new Error("Employer email details are unavailable.");
        error.statusCode = 422;
        throw error;
      }

      const company = await CompanyDetails.findOne({
        userId: employerId,
        isDel: false,
      })
        .select("name")
        .lean();

      const companyName =
        company?.name?.trim() || employerUser.name?.trim() || "The employer";

      const vendorName = submitRequest.vendorName?.trim() || "The vendor";

      const sharedAt = new Date();

      const updatedRequest = await VendorSubmitRequest.findOneAndUpdate(
        {
          _id: submitRequest._id,
          $expr: {
            $lte: [
              {
                $add: [
                  { $ifNull: ["$sharedCandidate", 0] },
                  newCandidateIds.length,
                ],
              },
              "$candidateCount",
            ],
          },
        },
        {
          $inc: { sharedCandidate: newCandidateIds.length },
          $set: { sharedCandidateDate: sharedAt },
          $push: { sharedCandidateHistory: sharedAt },
        },
        { new: true },
      );

      if (!updatedRequest) {
        const error = new Error(
          "Sharing these candidates would exceed the requested candidate count.",
        );
        error.statusCode = 409;
        throw error;
      }

      const records = newCandidateIds.map((CandidateId) => ({
        VendorSubmitRequestId: submitRequest._id,
        jobId,
        employerId,
        VendorId: vendorId,
        CandidateId,
      }));

      const createdCandidates =
        await VendorSendCandidateModel.insertMany(records);

      notificationData = {
        candidates: newCandidateIds.map((candidateId) => {
          const candidate = candidateUsersById.get(String(candidateId));

          return {
            candidateName: candidate.name || "Candidate",
            email: candidate.email,
          };
        }),
        employerName: employerUser.name || "Employer",
        employerEmail: employerUser.email,
        companyName,
        vendorName,
        jobTitle: submitRequest.jobTitle,
        candidateCount: createdCandidates.length,
      };

      responseData = {
        addedCount: createdCandidates.length,
        sharedCandidate: updatedRequest.sharedCandidate,
        sharedCandidateDate: updatedRequest.sharedCandidateDate,
        sharedCandidateHistory: updatedRequest.sharedCandidateHistory,
        candidateCount: updatedRequest.candidateCount,
        candidates: createdCandidates,
      };
    }

    if (notificationData) {
      try {
        const notificationJobs = notificationData.candidates.map(
          ({ candidateName, email }) =>
            emailQueue.add("vendor_candidate_shared", {
              candidateName,
              email,
              vendorName: notificationData.vendorName,
              companyName: notificationData.companyName,
              jobTitle: notificationData.jobTitle,
            }),
        );

        notificationJobs.push(
          emailQueue.add("vendor_candidates_shared_employer", {
            employerName: notificationData.employerName,
            employerEmail: notificationData.employerEmail,
            vendorName: notificationData.vendorName,
            companyName: notificationData.companyName,
            jobTitle: notificationData.jobTitle,
            candidateCount: notificationData.candidateCount,
          }),
        );

        await Promise.all(notificationJobs);
      } catch (error) {
        console.error(
          "Candidates shared but notification queueing failed:",
          error,
        );

        return res.status(503).json({
          success: false,
          message:
            "Candidates were shared, but one or more email notifications could not be queued.",
          data: responseData,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message:
        responseData.addedCount === 0
          ? "These candidates have already been shared."
          : "Candidates shared successfully.",
      data: responseData,
    });
  } catch (error) {
    console.error("Vendor send candidates error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "One or more candidates have already been shared for this job.",
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode && error.statusCode < 500
          ? error.message
          : "Unable to share candidates.",
    });
  }
};

export const listEmployerSubmitRequest = async (req, res) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1, 1_000_000);
    const limit = parsePositiveInteger(req.query.limit, 10, 100);

    if (!page || !limit) {
      return res.status(422).json({
        success: false,
        message: "page and limit must be positive integers.",
      });
    }

    const sortFields = new Set([
      "jobTitle",
      "candidateCount",
      "employerName",
      "createdAt",
    ]);

    const sort = req.query.sort || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";

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

    const filter = {
      VendorId: new mongoose.Types.ObjectId(req.userId),
      is_del: false,
    };

    const searchValue =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    const pipeline = [
      {
        $match: filter,
      },

      // Join User collection using employerId
      {
        $lookup: {
          from: "users",
          localField: "employerId",
          foreignField: "_id",
          as: "employerDetails",
        },
      },

      {
        $unwind: {
          path: "$employerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          employerName: {
            $ifNull: ["$employerDetails.name", ""],
          },
        },
      },
    ];

    // Search
    if (searchValue) {
      const searchRegex = new RegExp(escapeRegex(searchValue), "i");

      const searchConditions = [
        { jobTitle: searchRegex },
        { "employerDetails.name": searchRegex },
      ];

      if (!isNaN(Number(searchValue))) {
        searchConditions.push({
          candidateCount: Number(searchValue),
        });
      }

      pipeline.push({
        $match: {
          $or: searchConditions,
        },
      });
    }

    // Sorting
    const sortField = sort === "employerName" ? "employerDetails.name" : sort;

    pipeline.push({
      $sort: {
        [sortField]: sortOrder === "asc" ? 1 : -1,
        _id: 1,
      },
    });

    // Pagination and total count
    pipeline.push({
      $facet: {
        data: [
          {
            $skip: (page - 1) * limit,
          },
          {
            $limit: limit,
          },
          {
            $project: {
              employerDetails: 0,
            },
          },
        ],
        totalCount: [
          {
            $count: "total",
          },
        ],
      },
    });

    const result = await VendorSubmitRequest.aggregate(pipeline);
    console.log("qweqwrwer sdfdsgdsgdfgfd=>", result);
    const requests = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.total || 0;

    const formattedRequests = requests.map((item) => ({
      ...item,
      employerName: item.employerName || "",
    }));

    return res.status(200).json({
      success: true,
      data: formattedRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List received requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch received requests.",
    });
  }
};
// single request
export const employerSubmitRequest = async (req, res) => {
  try {
    const submitrequestsId = req.query.sbId.trim();
    const filter = {
      VendorId: new mongoose.Types.ObjectId(req.userId),
      _id: new mongoose.Types.ObjectId(submitrequestsId),
      is_del: false,
    };
    const pipeline = [
      {
        $match: filter,
      },

      // Join User collection using employerId
      {
        $lookup: {
          from: "users",
          localField: "employerId",
          foreignField: "_id",
          as: "employerDetails",
        },
      },

      {
        $unwind: {
          path: "$employerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          employerName: {
            $ifNull: ["$employerDetails.name", ""],
          },
        },
      },
    ];
    const result = await VendorSubmitRequest.aggregate(pipeline);
    const formattedRequests = result.map((item) => ({
      ...item,
      employerName: item.employerName || "",
    }));

    return res.status(200).json({
      success: true,
      data: formattedRequests,
    });
  } catch (error) {
    console.error("List received requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch received requests.",
    });
  }
};

export const getSharedCandidate = async (req, res) => {
  try {
    const sRId = req.query.sRId;
    const candidates = await VendorSendCandidateModel.aggregate([
      {
        $match: {
          VendorSubmitRequestId: new mongoose.Types.ObjectId(sRId),
          is_del: false,
          $or: [
            { VendorId: new mongoose.Types.ObjectId(req.userId) },
            { employerId: new mongoose.Types.ObjectId(req.userId) },
          ],
        },
      },
      {
        $lookup: {
          from: "vendorcandidates",
          localField: "CandidateId",
          foreignField: "CandidateId",
          as: "candidateDetails",
        },
      },
    ]);
    return res.status(200).json({
      success: true,
      data: candidates,
    });
  } catch (error) {
    console.error("List candidates error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to fetch candidates." });
  }
};
