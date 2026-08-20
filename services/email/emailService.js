import { transporter } from "../../config/transporter.js";


export const sendMail = async ({ to, subject, html, cc }) => {
    console.log("tddddddo: ", to)
    return transporter.sendMail({
        from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
        to: to,
        cc: cc,
        subject: subject,
        html: html
    });
};