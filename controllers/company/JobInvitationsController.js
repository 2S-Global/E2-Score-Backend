import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import JobInvitations from "../../models/company_Models/JobInvitations.js";
import JobInvitationHandoff from "../../models/company_Models/JobInvitationHandoff.js";
import JobPosting from "../../models/company_Models/JobPostingModel.js";
import CompanyDetails from "../../models/company_Models/companydetails.js";
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
      companyName: invitation.companyName,
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

const createInvitationHandoff = async (userId) => {
  const ticket = randomBytes(32).toString("hex");
  await JobInvitationHandoff.create({
    ticketHash: createHash("sha256").update(ticket).digest("hex"),
    userId,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });
  return ticket;
};

const htmlResponsePage = (content, companyName = "GEISIL") => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Job Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Outer Centered Wrapper -->
  <div style="background-color: #f8fafc; padding: 16px 8px; width: 100%; box-sizing: border-box; min-height: 100vh;">
    
    <!-- Main Email Card -->
    <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; width: 100%; box-sizing: border-box;">
      
      <!-- Top Banner Image Block (Fully Responsive) -->
      <div style="width: 100%; background-color: #ffffff; line-height: 0; text-align: center;">
        <img 
          src="https://res.cloudinary.com/da4unxero/image/upload/v1791972718/jobinvitationEmail_wxx3la.jpg" 
          alt="${escapeHtml(companyName)}" 
          style="display: block; width: 100%; max-width: 100%; height:149px; border: 0;" 
        />
      </div>

      <!-- Centered Company Name Bar -->
      <div style="background-color: #ffffff; padding: 14px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
        <span style="color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block;">
          ${escapeHtml(companyName)}
        </span>
      </div>
      <!-- Main Content Body -->
      <div style="padding: 28px 20px; color: #334155; line-height: 1.6; font-size: 15px;">
        <!-- Custom htmlContent -->
        ${content ? `<div style="margin-bottom: 24px; color: #475569;">${content}</div>` : ""}
        <div style="margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 14px; color: #475569;">
          Regards,<br />
          <strong style="color: #0f172a;">${escapeHtml(companyName)}</strong>
        </div>
      </div>

      <!-- Footer Section -->
      <div style="padding: 24px 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
        <!-- Footer Logo -->
        <div style="margin-bottom: 12px;">
          <img src="https://res.cloudinary.com/da4unxero/image/upload/v1746776002/QuikChek%20images/ntvxq8yy2l9de25t1rmu.png" alt="Footer Logo" style="display: inline-block; border: 0; width: 65px; height: auto;" />
        </div>
        <!-- Copyright & Company Info -->
        <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
          &copy; ${new Date().getFullYear()} ${escapeHtml(companyName)}. All rights reserved.<br />
          You received this email because you applied for a job through our platform.
        </div>
      </div>

    </div>
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
            "<strong>Invitation unavailable</strong><p>This invitation has already been answered or is no longer valid.</p>",
            payload?.companyName?.trim(),
          ),
        );
    }

    const token = escapeHtml(req.query.token);
    const requestedDecision = req.query.decision;
    const responseForm =
      requestedDecision === "Accepted"
        ? `
        <form id="invitation-response" method="post" action="/api/job-invitations/respond">
          <input type="hidden" name="token" value="${token}" />
          <input type="hidden" name="decision" value="Accepted" />
        </form>
        <script>document.getElementById("invitation-response").requestSubmit()</script>
      `
        : requestedDecision === "Rejected"
          ? `
        <form method="post" action="/api/job-invitations/respond">
          <input type="hidden" name="token" value="${token}" />
          <input type="hidden" name="decision" value="Rejected" />
          <button type="submit" style="padding:10px 18px;cursor:pointer">Reject</button>
        </form>
        <script>document.forms[0].requestSubmit()</script>
      `
          : `
        <p>Choose whether to accept this invitation.</p>
        <form method="post" action="/api/job-invitations/respond" style="display:flex;gap:12px;flex-wrap:wrap">
          <input type="hidden" name="token" value="${token}" />
          <button type="submit" name="decision" value="Accepted" style="padding:10px 18px;cursor:pointer">Profile Update</button>
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
        <p>Profile Update submits your application using “Not specified” for preferences that were not provided, then opens your candidate dashboard.</p>
        <p>By continuing, you agree to submit the application and accept its terms.</p>
        ${responseForm}
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

    let handoffUrl;
    try {
      const clientBaseUrl = process.env.CLIENT_FRONTEND_URL?.trim();
      if (!clientBaseUrl) {
        throw new Error("Client base URL is not configured.");
      }
      handoffUrl = new URL("/invitation-login", clientBaseUrl);
      if (!["http:", "https:"].includes(handoffUrl.protocol)) {
        throw new Error("Client base URL must use HTTP or HTTPS.");
      }
    } catch (error) {
      console.error("Invalid invitation dashboard configuration:", error);
      return res
        .status(500)
        .type("html")
        .send(
          htmlResponsePage(
            "<h1>Unable to continue</h1><p>The dashboard is temporarily unavailable. Please contact support.</p>",
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

    if (candidate?.is_del || candidate?.is_active === false) {
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

    if (!candidate.isVerified) {
      candidate.isVerified = true;
      await candidate.save();
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
    const handoffTicket = await createInvitationHandoff(candidate._id);

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
      /* emailJobs.push(
        emailQueue.add("job_application_candidate", {
          candidateEmail: candidate.email,
          job: candidateData,
        }),
      ); */
    }
    await Promise.all(emailJobs);

    handoffUrl.hash = new URLSearchParams({ ticket: handoffTicket }).toString();
    return res.redirect(303, handoffUrl.toString());
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

export const redeemJobInvitationHandoff = async (req, res) => {
  try {
    const { ticket } = req.body || {};
    if (typeof ticket !== "string" || !/^[a-f0-9]{64}$/i.test(ticket)) {
      return res.status(400).json({
        success: false,
        message: "A valid invitation handoff ticket is required.",
      });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Authentication is temporarily unavailable.",
      });
    }

    const handoff = await JobInvitationHandoff.findOneAndDelete({
      ticketHash: createHash("sha256").update(ticket).digest("hex"),
      expiresAt: { $gt: new Date() },
    });
    if (!handoff) {
      return res.status(401).json({
        success: false,
        message: "This invitation handoff has expired or was already used.",
      });
    }

    const candidate = await User.findOne({
      _id: handoff.userId,
      role: 1,
      is_del: false,
      is_active: true,
      isVerified: true,
    }).select("_id name role company_id");
    if (!candidate) {
      return res.status(401).json({
        success: false,
        message: "The candidate account is unavailable.",
      });
    }

    const token = jwt.sign(
      { userId: candidate._id, companyId: candidate.company_id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );
    return res.status(200).json({
      success: true,
      token,
      user: {
        name: candidate.name,
        role: candidate.role,
      },
    });
  } catch (error) {
    console.error("Failed to redeem job invitation handoff:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to sign in from this invitation. Please try again.",
    });
  }
};

export const addJobInvitation = async (req, res) => {
  try {
    const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "");

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

    const companyDetails = await CompanyDetails.findOne({
      userId: req.userId,
      isDel: false,
    })
      .select("name")
      .lean();
    invitation["companyName"] = companyDetails?.name?.trim() || "GEISIL";
    const newInvitation = {
      ...invitation.toObject(),
      companyName: companyDetails?.name?.trim() || "GEISIL",
    };
    const responseToken = createInvitationToken(newInvitation);
    await emailQueue.add("job_invitation", {
      name: invitation.senderName,
      email: invitation.senderEmail,
      jobTitle: invitation.jobTitle,
      companyName: companyDetails?.name?.trim() || "GEISIL",
      respondUrl: `${backendUrl}/api/job-invitations/respond?token=${encodeURIComponent(responseToken)}`,
      loginId: req?.userId,
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
