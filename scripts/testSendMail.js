import dotenv from "dotenv";
dotenv.config();
import { sendMail } from "../services/email/emailService.js";

const run = async () => {
  try {

    const info = await sendMail({
      to: "abhisekkaran2001@gmail.com",
      subject: "Temporary Test Email",
      html: "<p>This is a temporary test email sent via scripts/testSendMail.js to verify the mail configuration.</p>"
    });
    console.log("✅ Email sent successfully!", info);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};

run();
