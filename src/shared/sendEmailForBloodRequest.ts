import nodemailer from 'nodemailer'
import config from '../config/config.js';

const sendBloodRequestEmail = async (
  donorEmail: string, 
  patientName: string, 
  bloodGroup: string,
  dashboardLink: string
) => {
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
    from: `"LifeShare - Blood Network" <${config.app_gmail}>`,
    to: donorEmail,
    subject: `জরুরী: ${bloodGroup} রক্তের জন্য একটি নতুন অনুরোধ এসেছে! 🩸`,
    text: `হ্যালো, প্যাসেন্ট ${patientName} আপনার কাছে ${bloodGroup} রক্তের জন্য একটি অনুরোধ পাঠিয়েছেন। বিস্তারিত দেখতে আপনার ড্যাশবোর্ডে লগইন করুন: ${dashboardLink}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #f8d7da; padding-bottom: 10px;">
           <h1 style="color: #e74c3c; margin: 0;">LifeShare 🩸</h1>
        </div>
        <h2 style="color: #2c3e50; text-align: center;">রক্তের জরুরী অনুরোধ!</h2>
        <p>হ্যালো,</p>
        <p>আশা করি আপনি ভালো আছেন। জীবন বাঁচানোর এই মহৎ প্ল্যাটফর্মে আপনাকে স্বাগতম।</p>
        <div style="background-color: #fff5f5; border-left: 5px solid #e74c3c; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>প্যাসেন্টের নাম:</strong> ${patientName}</p>
          <p style="margin: 5px 0;"><strong>রক্তের গ্রুপ:</strong> <span style="color: #e74c3c; font-size: 18px; font-weight: bold;">${bloodGroup}</span></p>
        </div>
        <p>প্যাসেন্ট আপনার রক্তদানের পোস্টটি দেখে আপনার সাহায্য প্রার্থনা করেছেন। আপনি যদি এই মুহূর্তে রক্তদানে সক্ষম হন, তবে দয়া করে নিচের বাটনে ক্লিক করে অনুরোধটি গ্রহণ (Accept) করুন:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${dashboardLink}" 
            style="background-color: #e74c3c; color: #fff; padding: 12px 30px; 
                   text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            অনুরোধটি দেখুন
          </a>
        </p>
        <p style="font-size: 14px; color: #555;">আপনি অনুরোধটি গ্রহণ করলে প্যাসেন্ট আপনার সাথে যোগাযোগের অনুমতি পাবেন।</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">
          আপনি জীবন বাঁচানোর একজন বীর। আপনাকে ধন্যবাদ!<br>
          © ${new Date().getFullYear()} LifeShare Network. All rights reserved.
        </p>
      </div>
    `,
  });

  console.log("Blood Request Email sent:", info.messageId);
}

export default sendBloodRequestEmail;