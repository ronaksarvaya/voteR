const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendEmail } = require("../utils/email");

function generateResetToken() {
    return crypto.randomBytes(32).toString("hex");
}

module.exports = (db) => {
    const router = express.Router();

    // Forgot Password - Request reset
    router.post("/forgot-password", async (req, res) => {
        console.log("[FORGOT-PASSWORD] New request");
        let { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        email = email.trim().toLowerCase();

        try {
            const user = await db.collection("users").findOne({ email });

            if (!user) {
                // Security: Don't reveal user existence
                return res.json({ message: "If the email exists, a password reset link has been sent." });
            }

            const resetToken = generateResetToken();
            const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            await db.collection("users").updateOne({ email }, { $set: { resetToken, resetTokenExpiry } });

            const frontendUrl = process.env.FRONTEND_URL || "https://vote-r.vercel.app";
            const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

            try {
                await sendEmail({
                    to: email,
                    subject: "VoteR - Password Reset Request",
                    html: `
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password for VoteR.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #248232; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
          `,
                    text: `Reset your password: ${resetUrl}`,
                });

                res.json({
                    message: "Password reset link generated.",
                    resetLink: resetUrl,
                    note: "Email sending is currently being bypassed/debugged. Please use the link below."
                });
            } catch (emailError) {
                console.error("[FORGOT-PASSWORD] Email failed:", emailError);
                // Return link even if email fails
                return res.json({
                    message: "Email failed to send, but here is your reset link:",
                    resetLink: resetUrl,
                    error: "Email service timeout"
                });
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            res.status(500).json({ error: "Failed to process request" });
        }
    });

    // Verify Reset Token
    router.post("/verify-reset-token", async (req, res) => {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: "Token is required" });

        try {
            const user = await db.collection("users").findOne({ resetToken: token });
            if (!user) return res.status(400).json({ error: "Invalid or expired reset token" });

            if (new Date() > user.resetTokenExpiry) {
                return res.status(400).json({ error: "Reset token has expired" });
            }

            res.json({ message: "Token is valid", email: user.email });
        } catch (err) {
            console.error("Verify token error:", err);
            res.status(500).json({ error: "Failed to verify token" });
        }
    });

    // Reset Password - Set new password
    router.post("/reset-password", async (req, res) => {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ error: "Token and password required" });

        try {
            const user = await db.collection("users").findOne({ resetToken: token });
            if (!user) return res.status(400).json({ error: "Invalid or expired reset token" });

            if (new Date() > user.resetTokenExpiry) {
                return res.status(400).json({ error: "Reset token has expired" });
            }

            const passwordHash = await bcrypt.hash(newPassword, 10);

            await db.collection("users").updateOne(
                { resetToken: token },
                {
                    $set: { passwordHash },
                    $unset: { resetToken: "", resetTokenExpiry: "" },
                }
            );

            res.json({ message: "Password reset successful" });
        } catch (err) {
            console.error("Reset password error:", err);
            res.status(500).json({ error: "Failed to reset password" });
        }
    });

    return router;
};
