import nodemailer from "nodemailer";

const accounts = {
  kyc: {
    user: process.env.SMTP_KYC_USER,
    pass: process.env.SMTP_KYC_PASS,
    name: "GEISIL KYC",
  },

  profile: {
    user: process.env.SMTP_PROFILE_USER,
    pass: process.env.SMTP_PROFILE_PASS,
    name: "GEISIL Profile",
  },

  skills: {
    user: process.env.SMTP_SKILLS_USER,
    pass: process.env.SMTP_SKILLS_PASS,
    name: "GEISIL Skills",
  },

  personal: {
    user: process.env.SMTP_PERSONAL_USER,
    pass: process.env.SMTP_PERSONAL_PASS,
    name: "GEISIL Personal",
  },

  patent: {
    user: process.env.SMTP_PATENT_USER,
    pass: process.env.SMTP_PATENT_PASS,
    name: "GEISIL Patent",
  },

  experience: {
    user: process.env.SMTP_EXPERIENCE_USER,
    pass: process.env.SMTP_EXPERIENCE_PASS,
    name: "GEISIL Experience",
  },

  career: {
    user: process.env.SMTP_CAREER_USER,
    pass: process.env.SMTP_CAREER_PASS,
    name: "GEISIL Career",
  },

  research: {
    user: process.env.SMTP_RESEARCH_USER,
    pass: process.env.SMTP_RESEARCH_PASS,
    name: "GEISIL Research",
  },

  achievements: {
    user: process.env.SMTP_ACHIEVEMENTS_USER,
    pass: process.env.SMTP_ACHIEVEMENTS_PASS,
    name: "GEISIL Achievements",
  },

  education: {
    user: process.env.SMTP_EDUCATION_USER,
    pass: process.env.SMTP_EDUCATION_PASS,
    name: "GEISIL Education",
  },

  projects: {
    user: process.env.SMTP_PROJECTS_USER,
    pass: process.env.SMTP_PROJECTS_PASS,
    name: "GEISIL Projects",
  },

  documents: {
    user: process.env.SMTP_DOCUMENTS_USER,
    pass: process.env.SMTP_DOCUMENTS_PASS,
    name: "GEISIL Documents",
  },

  registration: {
    user: process.env.SMTP_REGISTRATION_USER,
    pass: process.env.SMTP_REGISTRATION_PASS,
    name: "GEISIL Registration",
  },

  password: {
    user: process.env.SMTP_PASSWORD_USER,
    pass: process.env.SMTP_PASSWORD_PASS,
    name: "GEISIL Password",
  },

  jobs: {
    user: process.env.SMTP_JOBS_USER,
    pass: process.env.SMTP_JOBS_PASS,
    name: "GEISIL Jobs",
  },

  interviews: {
    user: process.env.SMTP_INTERVIEWS_USER,
    pass: process.env.SMTP_INTERVIEWS_PASS,
    name: "GEISIL Interviews",
  },

  verification: {
    user: process.env.SMTP_VERIFICATION_USER,
    pass: process.env.SMTP_VERIFICATION_PASS,
    name: "GEISIL Verification",
  },
};

const HOST = process.env.EMAIL_HOST;
const PORT = Number(process.env.EMAIL_PORT || 465);

const transporters = {};

function getTransporter(type) {
  const account = accounts[type];

  if (!account) {
    throw new Error(`Unknown email account: ${type}`);
  }

  if (!account.user || !account.pass) {
    throw new Error(`Missing SMTP credentials for: ${type}`);
  }

  if (!transporters[type]) {
    transporters[type] = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
  }

  return transporters[type];
}

export const sendMail = async ({
  type,
  to,
  subject,
  text,
  html,
}) => {
  const account = accounts[type];

  if (!account) {
    throw new Error(`Invalid email type: ${type}`);
  }

  const transporter = getTransporter(type);

  const info = await transporter.sendMail({
    from: `"${account.name}" <${account.user}>`,
    to,
    subject,
    text,
    html,
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  };
};