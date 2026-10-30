import mongoose from "mongoose";
import {
  CompanyMailTemplate,
  MailTemplate,
} from "../../models/company_Models/MailTemplatesModel.js";

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

export const getCompanyMailTemplates = async (req, res) => {
  try {
    const templates = await CompanyMailTemplate.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: templates });
  } catch (error) {
    console.error("Error getting company mail templates:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while getting company mail templates",
      error: error.message,
    });
  }
};

export const getCompanyMailTemplate = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid mail template ID" });
  }

  try {
    const template = await CompanyMailTemplate.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).lean();

    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Company mail template not found" });
    }

    return res.status(200).json({ success: true, data: template });
  } catch (error) {
    console.error("Error getting company mail template:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while getting company mail template",
      error: error.message,
    });
  }
};

export const createCompanyMailTemplate = async (req, res) => {
  const { templateId, description } = req.body || {};
  if (!isValidObjectId(templateId)) {
    return res
      .status(400)
      .json({ success: false, message: "A valid templateId is required" });
  }
  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({
      success: false,
      message: "description must be strings",
    });
  }

  try {
    const baseTemplate = await MailTemplate.findById(templateId).lean();
    if (!baseTemplate) {
      return res
        .status(404)
        .json({ success: false, message: "Mail template not found" });
    }

    const existingTemplate = await CompanyMailTemplate.findOne({
      userId: req.userId,
      templateId: baseTemplate._id,
    }).lean();
    if (existingTemplate) {
      return res.status(409).json({
        success: false,
        message: "This mail template has already been added",
      });
    }

    const template = await CompanyMailTemplate.create({
      userId: req.userId,
      templateId: baseTemplate._id,
      templateName: baseTemplate?.templateName,
      description: description ?? baseTemplate.description,
    });

    return res.status(201).json({
      success: true,
      message: "Company mail template created successfully",
      data: template,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This mail template has already been added",
      });
    }

    console.error("Error creating company mail template:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating company mail template",
      error: error.message,
    });
  }
};

export const updateCompanyMailTemplate = async (req, res) => {
  const { templateName, description, templateId } = req.body || {};
  const updates = {};

  if (!isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid mail template ID" });
  }
  if (!isValidObjectId(templateId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid mail template ID" });
  }
  updates.templateId = templateId;
  if (templateName !== undefined) {
    if (typeof templateName !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "templateName must be a string" });
    }
    updates.templateName = templateName;
  }
  if (description !== undefined) {
    if (typeof description !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "description must be a string" });
    }
    updates.description = description;
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one of templateName or description is required",
    });
  }

  try {
    const template = await CompanyMailTemplate.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Company mail template not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Company mail template updated successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error updating company mail template:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating company mail template",
      error: error.message,
    });
  }
};

export const deleteCompanyMailTemplate = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid mail template ID" });
  }

  try {
    const template = await CompanyMailTemplate.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Company mail template not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Company mail template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting company mail template:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting company mail template",
      error: error.message,
    });
  }
};

export const getMailTemplateList = async (_req, res) => {
  try {
    const templates = await MailTemplate.find()
      .sort({ templateName: 1 })
      .lean();

    return res.status(200).json({ success: true, data: templates });
  } catch (error) {
    console.error("Error getting mail template list:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while getting mail template list",
      error: error.message,
    });
  }
};
