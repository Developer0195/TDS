const nodemailer = require("nodemailer");

exports.sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    to: email,
    subject: "Verify your email",
    html: `
      <h3>Welcome 👋</h3>
      <p>Click below to verify your email:</p>
      <a href="${verifyUrl}" style="padding:10px 20px;background:#2563eb;color:#fff;border-radius:5px;text-decoration:none">
        Continue Signup
      </a>
      <p>This link expires in 1 hour.</p>
    `,
  });
};


