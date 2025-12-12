// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html, attachment = null) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS, // your App Password
      },
      tls: {
    rejectUnauthorized: false, // 👈 allows self-signed certs
  },
    });

    const mailOptions = {
      from: `"ShopSphere" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    // ✅ Attach PDF if provided
    if (attachment) {
      mailOptions.attachments = [
        {
          filename: attachment.filename,
          path: attachment.path,
          contentType: "application/pdf",
        },
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};

module.exports = sendEmail;
