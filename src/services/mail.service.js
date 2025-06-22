import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendMail(email, subject, token, user) {
  transport.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: creationMailVerificationCode(token, user),
  });
}

function creationMailVerificationCode(token, user) {
  const verificationLink = `${
    process.env.APP_URL || "http://localhost:3000"
  }/verify-email?token=${token}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #ff6b6b;
    }
    .content {
      padding: 30px 20px;
      text-align: center;
    }
    h1 {
      color: #333;
      margin-top: 0;
    }
    .verification-button {
      display: inline-block;
      padding: 12px 24px;
      margin: 25px 0;
      background-color: #ff6b6b;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      text-align: center;
    }
    .verification-button:hover {
      background-color: #ff5252;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #777;
      font-size: 14px;
    }
    .note {
      font-size: 13px;
      color: #888;
      margin-top: 20px;
    }
    .social-links {
      margin-top: 15px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #ff6b6b;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">FunkyVaso</div>
    </div>
    <div class="content">
      <h1>Verify Your Email Address</h1>
      <p>Hi ${user},</p>
      <p>Thanks for signing up for FunkyVaso! We're excited to have you on board.</p>
      <p>Please click the button below to verify your email address and activate your account:</p>
      
      <a href="${verificationLink}" class="verification-button">Verify My Email</a>
      
      <p>This link will expire in 1 hour for security reasons.</p>
      
      <p>If you didn't create an account with FunkyVaso, you can safely ignore this email.</p>
      
      <div class="note">
        <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
        <p>${verificationLink}</p>
      </div>
    </div>
    <div class="footer">
      <p>FunkyVaso - Bringing color and joy to your refreshments since 2023</p>
      <div class="social-links">
        <a href="#">Facebook</a>
        <a href="#">Instagram</a>
        <a href="#">Twitter</a>
      </div>
      <p>&copy; 2023 FunkyVaso. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
}
