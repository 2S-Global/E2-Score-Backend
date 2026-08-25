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
        console.warn(
            "No admin users (role = 0) found in the database. Falling back to default recipient."
        );

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

    console.log(
        `Sending report email to admin(s): ${emailRecipientString}...`
    );

    await sendMail({
        type: "verification",

        to: emailRecipientString,

        subject: `Failed API Requests Report - ${new Date().toLocaleDateString(
            "en-IN",
            {
                timeZone: "Asia/Kolkata",
            }
        )}`,

        text: `
Hello,

Please find attached the failed API requests report.

Report Period: ${formattedFrom} to ${formattedTo}

Total failures: ${failuresCount}.

Best regards,
E2-Score System
        `.trim(),

        html: `
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
                E2-Score System
            </p>
        `,

        attachments: [
            {
                filename: "Failed_Requests_Report.pdf",
                content: pdfBuffer,
                contentType: "application/pdf",
            },
        ],
    });
};