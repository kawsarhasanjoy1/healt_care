import nodemailer from 'nodemailer';
import config from '../config/config.js';
const sendEmail = async (userEmail, resetLink) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: config.app_gmail,
            pass: config.app_pass
        },
    });
    const info = await transporter.sendMail({
        from: `"Support Team" <${config.app_gmail}>`,
        to: userEmail,
        subject: "Reset Your Password - Action Required",
        text: `Hello,

We received a request to reset your account password. If you made this request, please use the link below to set a new password:
${resetLink}

If you didn’t request a password reset, you can safely ignore this email.

Best regards,
The Support Team`,
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset your account password. If you made this request, please click the button below to set a new password:</p>
        <p style="text-align: center;">
          <a href="${resetLink}" 
            style="background-color: #007bff; color: #fff; padding: 10px 20px; 
                   text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If the button above doesn’t work, copy and paste the following link into your browser:</p>
        <p><a href="${resetLink}" style="color: #007bff;">${resetLink}</a></p>
        <hr style="border: none; border-top: 1px solid #ccc;">
        <p style="font-size: 12px; color: #888;">
          If you didn’t request a password reset, you can safely ignore this email.<br>
          © ${new Date().getFullYear()} KHJ. All rights reserved.
        </p>
      </div>
    `,
    });
    console.log("Email sent:", info.messageId);
};
export default sendEmail;
