import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import JobInvitations from "../../models/company_Models/JobInvitations.js";
import JobPosting from "../../models/company_Models/JobPostingModel.js";
import JobApplication from "../../models/jobApplicationModel.js";
import User from "../../models/userModel.js";
import CandidateDetails from "../../models/CandidateDetailsModel.js";
import personalDetails from "../../models/personalDetails.js";
import { emailQueue } from "../../queues/emailQueue.js";

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const createInvitationToken = (invitation) =>
  jwt.sign(
    {
      invitationId: invitation._id.toString(),
      email: invitation.senderEmail,
      purpose: "job-invitation-response",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

const verifyInvitationToken = (token) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  if (payload.purpose !== "job-invitation-response") {
    throw new Error("Invalid invitation response token.");
  }
  return payload;
};

const htmlResponsePage = (content) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Job invitation</title>
  </head>
  <body style="font-family:Arial,sans-serif;color:#222;max-width:560px;margin:48px auto;padding:24px;line-height:1.5">
   <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.EMAIL_HEADER_LOGO_URL || "https://services.geisil.com/assets/Logo-D7c9kIlT.webp"}" alt="Banner" style="width: 100%; height: auto;" />
  </div>
    ${content}
     <div style="text-align: center; margin-top: 30px;">
      <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer" style="width:97px; height: 116px;" />
    </div>
  </body>
</html>`;

export const showJobInvitationResponse = async (req, res) => {
  try {
    const payload = verifyInvitationToken(req.query.token);
    const invitation = await JobInvitations.findById(
      payload.invitationId,
    ).lean();

    if (
      !invitation ||
      invitation.senderEmail.toLowerCase() !== payload.email.toLowerCase() ||
      invitation.status !== "Sent"
    ) {
      return res
        .status(410)
        .type("html")
        .send(
          htmlResponsePage(
            "<h1>Invitation unavailable</h1><p>This invitation has already been answered or is no longer valid.</p>",
          ),
        );
    }

    const token = escapeHtml(req.query.token);
    const requestedDecision = req.query.decision;
    const confirmationForm = ["Accepted", "Rejected"].includes(
      requestedDecision,
    )
      ? `
      <p>${requestedDecision === "Accepted" ? "Confirming will submit your application and record your acceptance of the application terms." : "Confirming will record your rejection of this invitation."}</p>
        <form method="post" action="/api/job-invitations/respond">
          <input type="hidden" name="token" value="${token}" />
          <input type="hidden" name="decision" value="${requestedDecision}" />
          <button type="submit" style="padding:10px 18px;cursor:pointer">Confirm ${requestedDecision === "Accepted" ? "Accept" : "Reject"}</button>
        </form>
      `
      : `
        <p>Choose whether to accept this invitation.</p>
        <form method="post" action="/api/job-invitations/respond" style="display:flex;gap:12px;flex-wrap:wrap">
          <input type="hidden" name="token" value="${token}" />
          <button type="submit" name="decision" value="Accepted" style="padding:10px 18px;cursor:pointer">Accept</button>
          <button type="submit" name="decision" value="Rejected" style="padding:10px 18px;cursor:pointer">Reject</button>
        </form>
      `;
    return res
      .status(200)
      .type("html")
      .send(
        htmlResponsePage(`
        <h1>Job invitation</h1>
        <p>You've been invited to apply for <strong>${escapeHtml(invitation.jobTitle)}</strong>.</p>
        <p>Accepting submits an application using “Not specified” for preferences that were not provided.</p>
        <p>By confirming Accept, you agree to submit the application and accept its terms.</p>
        ${confirmationForm}
      `),
      );
  } catch {
    return res
      .status(400)
      .type("html")
      .send(
        htmlResponsePage(
          "<h1>Invalid invitation link</h1><p>This invitation link is invalid or has expired.</p>",
        ),
      );
  }
};

export const respondToJobInvitation = async (req, res) => {
  try {
    const { decision, token } = req.body;
    if (!["Accepted", "Rejected"].includes(decision)) {
      return res
        .status(400)
        .type("html")
        .send(
          htmlResponsePage(
            "<h1>Invalid response</h1><p>Select Accept or Reject to continue.</p>",
          ),
        );
    }

    const payload = verifyInvitationToken(token);
    const invitation = await JobInvitations.findById(payload.invitationId);
    if (
      !invitation ||
      invitation.senderEmail.toLowerCase() !== payload.email.toLowerCase()
    ) {
      return res
        .status(404)
        .type("html")
        .send(htmlResponsePage("<h1>Invitation not found</h1>"));
    }
    if (invitation.status !== "Sent") {
      return res
        .status(409)
        .type("html")
        .send(htmlResponsePage("<h1>Invitation already answered</h1>"));
    }

    if (decision === "Rejected") {
      invitation.status = "Rejected";
      await invitation.save();
      return res
        .status(200)
        .type("html")
        .send(
          htmlResponsePage(
            "<h1>Invitation rejected</h1><p>Your response has been recorded.</p>",
          ),
        );
    }

    const job = await JobPosting.findOne({
      _id: invitation.jobId,
      is_del: false,
    }).select("jobTitle experienceLevel getApplicationUpdateEmail");

    if (!job) {
      return res
        .status(404)
        .type("html")
        .send(
          htmlResponsePage(
            "<h1>Job unavailable</h1><p>This job posting is no longer available.</p>",
          ),
        );
    }

    const normalizedEmail = invitation.senderEmail.trim().toLowerCase();
    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let candidate = await User.findOne({
      email: { $regex: `^${escapedEmail}$`, $options: "i" },
    });
    let newAccountPassword;

    if (candidate?.is_del) {
      return res
        .status(409)
        .type("html")
        .send(
          htmlResponsePage(
            "<h1>Account unavailable</h1><p>This email belongs to an inactive account. Please contact support.</p>",
          ),
        );
    }

    if (candidate && candidate.role !== 1) {
      return res
        .status(409)
        .type("html")
        .send(
          htmlResponsePage(
            "<h1>Account conflict</h1><p>This email is already associated with a non-candidate account. Please contact support.</p>",
          ),
        );
    }

    if (!candidate) {
      newAccountPassword = randomBytes(12).toString("hex");
      candidate = await User.create({
        name: invitation.senderName,
        email: normalizedEmail,
        password: await bcrypt.hash(newAccountPassword, 10),
        role: 1,
        self_registered: 1,
      });
      await Promise.all([
        CandidateDetails.updateOne(
          { userId: candidate._id },
          { $setOnInsert: { userId: candidate._id } },
          { upsert: true },
        ),
        personalDetails.updateOne(
          { user: candidate._id },
          {
            $setOnInsert: {
              user: candidate._id,
              visibility: { openToWork: true, showProfileInSearch: true },
            },
          },
          { upsert: true },
        ),
      ]);
    }

    const application = await JobApplication.findOne({
      jobId: invitation.jobId,
      userId: candidate._id,
    });
    const wasAlreadyApplied = Boolean(application);

    if (!application) {
      await JobApplication.create({
        jobId: invitation.jobId,
        userId: candidate._id,
        noticePeriod: "Not specified",
        preferredTime: "Not specified",
        availabilityOnSaturday: "Not specified",
        willingToRelocate: "Not specified",
        experienceLevel: "Not specified",
        acceptedTerms: true,
        recruitmentSources: "Direct",
      });
    }

    invitation.status = "Accepted";
    await invitation.save();

    const emailJobs = [];
    if (newAccountPassword) {
      const verificationToken = jwt.sign(
        { userId: candidate._id },
        process.env.JWT_SECRET,
        { expiresIn: "30d" },
      );
      emailJobs.push(
        emailQueue.add("candidate_registration", {
          name: candidate.name,
          email: candidate.email,
          password: newAccountPassword,
          token: verificationToken,
        }),
      );
    }
    if (!wasAlreadyApplied) {
      const candidateData = {
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        candidatePhone: candidate.phone_number,
        jobTitle: job.jobTitle,
      };
      if (job.getApplicationUpdateEmail) {
        emailJobs.push(
          emailQueue.add("job_application_update_employer", {
            employerEmail: job.getApplicationUpdateEmail,
            job: { ...candidateData, userId: invitation.employerId },
          }),
        );
      }
      emailJobs.push(
        emailQueue.add("job_application_candidate", {
          candidateEmail: candidate.email,
          job: candidateData,
        }),
      );
    }
    await Promise.all(emailJobs);

    return res
      .status(200)
      .type("html")
      .send(
        htmlResponsePage(
          wasAlreadyApplied
            ? "<h1>Invitation accepted</h1><p>You have already applied for this job.</p>"
            : "<h1>Invitation accepted</h1><p>Your job application has been submitted.</p>",
        ),
      );
  } catch (error) {
    console.error("Failed to process job invitation response:", error);
    return res
      .status(500)
      .type("html")
      .send(
        htmlResponsePage(
          "<h1>Unable to process response</h1><p>Please try again later or contact support.</p>",
        ),
      );
  }
};

export const addJobInvitation = async (req, res) => {
  try {
    const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "");

    console.log(
      "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq=========================>",
      process.env.BACKEND_URL,
      process.env.JWT_SECRET,
    );
    if (!backendUrl || !process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Invitation email configuration is incomplete.",
      });
    }

    const { jobId, senderName, senderEmail, designation } = req.body;

    if (
      !mongoose.isValidObjectId(jobId) ||
      !senderName?.trim() ||
      !senderEmail?.trim() ||
      !designation?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "jobId, senderName, senderEmail, and designation are required.",
      });
    }

    const job = await JobPosting.findOne({
      _id: jobId,
      userId: req.userId,
      is_del: false,
    }).select("jobTitle");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found for this company.",
      });
    }

    const invitation = await JobInvitations.create({
      employerId: req.userId,
      jobId: job._id,
      jobTitle: job.jobTitle,
      senderName: senderName.trim(),
      senderEmail: senderEmail.trim().toLowerCase(),
      designation: designation.trim(),
    });

    const responseToken = createInvitationToken(invitation);
    await emailQueue.add("job_invitation", {
      name: invitation.senderName,
      email: invitation.senderEmail,
      jobTitle: invitation.jobTitle,
      respondUrl: `${backendUrl}/api/job-invitations/respond?token=${encodeURIComponent(responseToken)}`,
    });

    return res.status(201).json({
      success: true,
      message: "Job invitation added and email queued successfully.",
      data: invitation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add job invitation.",
      error: error.message,
    });
  }
};

export const getJobInvitationList = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
      100,
    );
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const filter = {
      employerId: req.userId,
      is_del: 0,
    };

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapedSearch, "i");
      filter.$or = [
        { jobTitle: searchRegex },
        { senderName: searchRegex },
        { senderEmail: searchRegex },
        { designation: searchRegex },
      ];
    }

    const [data, total] = await Promise.all([
      JobInvitations.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      JobInvitations.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Job invitations fetched successfully.",
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job invitations.",
      error: error.message,
    });
  }
};
