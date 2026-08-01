import { transporter } from "../../config/transporter.js";


export const sendMail = async ({ to, subject, html, cc }) => {
    return transporter.sendMail({
        from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
        to: to,
        cc: cc,
        subject: subject,
        html: html
    });
};