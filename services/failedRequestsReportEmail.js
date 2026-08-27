import User from "../models/userModel.js";
import { sendMail } from "./email/emailService.js";

export const sendFailedRequestsReportEmail = async (
    pdfBuffer,
    failuresCount,
    from,
    to
) => {
    const admins = await User.find({ role: 0 }, "email").lean();

    const adminEmails = admins
        .map((admin) => admin.email)
        .filter(Boolean);

    if (adminEmails.length === 0) {
        adminEmails.push("gamermohan39@gmail.com");
    }

    const formatDateTime = (date) =>
        new Date(date).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short",
        });

    const formattedFrom = formatDateTime(from);
    const formattedTo = formatDateTime(to);

    const emailRecipientString = adminEmails.join(", ");



    const mailOptions = {
        type: "verification",
        to: emailRecipientString,
        subject: `Failed API Requests Report - ${new Date().toLocaleDateString(
            "en-IN",
            {
                timeZone: "Asia/Kolkata",
            }
        )}`,
    };

    if (failuresCount === 0) {
        mailOptions.text = `
Hello,

There were no failed API requests 
found for this period.

Report Period: ${formattedFrom} to ${formattedTo}

Best regards,
Global Employability Information Services India Limited
        `.trim();

        mailOptions.html = `
            <p>Hello,</p>

            <p>There were no failed API requests found for this period.</p>

            <p>
                <strong>Report Period:</strong><br>
                ${formattedFrom} to ${formattedTo}
            </p>

            <br>

            <p>
                Best regards,<br>
                Global Employability Information Services India Limited
            </p>
        `;
    } else {
        mailOptions.text = `
Hello,

Please find attached the failed API requests report.

Report Period: ${formattedFrom} to ${formattedTo}

Total failures: ${failuresCount}.

Best regards,
Global Employability Information Services India Limited
        `.trim();

        mailOptions.html = `
            <p>Hello,</p>

            <p>Please find attached the failed API requests report.</p>

            <p>
                <strong>Report Period:</strong><br>
                ${formattedFrom} to ${formattedTo}
            </p>

            <p>
                Total failures:
                <strong>${failuresCount}</strong>
            </p>

            <br>

            <p>
                Best regards,<br>
                Global Employability Information Services India Limited
            </p>
        `;

        mailOptions.attachments = [
            {
                filename: "Failed_Requests_Report.pdf",
                content: pdfBuffer,
                contentType: "application/pdf",
            },
        ];
    }

    await sendMail(mailOptions);
};