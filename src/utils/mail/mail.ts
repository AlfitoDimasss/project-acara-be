import nodemailer from "nodemailer";
import {EMAIL_SMTP_HOST, EMAIL_SMTP_PASS, EMAIL_SMTP_PORT, EMAIL_SMTP_SECURE, EMAIL_SMTP_USER,} from "../env";
import ejs from "ejs";
import path from "path";

if (!EMAIL_SMTP_USER || !EMAIL_SMTP_PASS || !EMAIL_SMTP_HOST) {
    console.warn("⚠️ SMTP config is missing. Email service may not work.");
}

const transporter = nodemailer.createTransport({
    port: EMAIL_SMTP_PORT,
    host: EMAIL_SMTP_HOST,
    secure: EMAIL_SMTP_SECURE,
    auth: {
        user: EMAIL_SMTP_USER,
        pass: EMAIL_SMTP_PASS,
    },
    requireTLS: true,
});

export interface ISendMail {
    from: string;
    to: string;
    subject: string;
    html: string;
}

export const sendMail = async ({from, to, subject, html}: ISendMail) => {
    try {
        return await transporter.sendMail({from, to, subject, html});
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error);
        throw new Error("Failed to send email");
    }
};

export const renderMailContent = async (
    template: string,
    data: Record<string, any>
): Promise<string> => {
    try {
        return await ejs.renderFile(
            path.join(__dirname, `templates/${template}`),
            data
        );
    } catch (error) {
        console.error(`Failed to render email template: ${template}`, error);
        throw new Error("Failed to render email template.");
    }
};
