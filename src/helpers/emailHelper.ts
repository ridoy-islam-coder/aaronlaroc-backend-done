
// import nodemailer from "nodemailer";
// import mailgun from "nodemailer-mailgun-transport";
// import { config } from "../app/config";

// export const SendEmail = async (EmailTo: string,  EmailText: string,  EmailSubject: string) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//       user: "rkrafikridoy5887@gmail.com",
//       pass: "crba acbp ezyv rqlw",
//     },
//     tls: {
//       rejectUnauthorized: false,
//     },
//   });

//   const mailOptions = {
//         from:'Task manager MERN <rkrafikridoy5887@gmail.com>',
//         to:EmailTo,
//         subject:EmailText,
//         text:EmailSubject
//   };

//   return transporter.sendMail(mailOptions);
//   };



import nodemailer from "nodemailer";
import mg from "nodemailer-mailgun-transport";
import { config } from "../app/config";



export const SendEmail = async (
  EmailTo: string,
  EmailSubject: string,
  EmailHtml: string
) => {
  if (!config.email.api_key || !config.email.domain) {
    throw new Error("Mailgun configuration is missing in .env");
  }

  const auth = {
    auth: {
      api_key: config.email.api_key,
      domain: config.email.domain,
    },
  };

  const transporter = nodemailer.createTransport(mg(auth));

  const mailOptions = {
    from: `${config.email.from}`, // verified email from Mailgun domain
    to: EmailTo,
    subject: EmailSubject,
    html: EmailHtml, // ✅ HTML property
  };

  return await transporter.sendMail(mailOptions);
};



export const generateOTPEmailTemplate = (otp: number) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height:1.5; color: #333;">
    <h2 style="color: #1a73e8;">Your OTP Code</h2>
    <p>Hi there,</p>
    <p>Thank you for using My Planeer. Your One-Time Password (OTP) is:</p>
    <p style="font-size: 24px; font-weight: bold; color: #e53935;">${otp}</p>
    <p>This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
    <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
    <p style="font-size: 12px; color: #999;">If you did not request this OTP, please ignore this email.</p>
  </div>
  `;
};