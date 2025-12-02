const nodemailer = require("nodemailer");

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // use STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    family: 4, // Force IPv4
    debug: true, // Enable debug output
    logger: true, // Log to console
});

transporter.verify((error, success) => {
    if (error) {
        console.error("[Email Service] Transporter verification failed:", error);
    } else {
        console.log("[Email Service] Ready to send messages");
    }
});

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
            text,
        });
        console.log("[Email Service] Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("[Email Service] Send failed:", error);
        throw error;
    }
};

module.exports = { sendEmail };
