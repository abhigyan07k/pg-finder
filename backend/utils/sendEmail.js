const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Yoo Rental" <${process.env.EMAIL_USER}>`,
    to,
    subject,

    html: `
      <div style="font-family: Arial, sans-serif; background:#f4f7fb; padding:40px 20px;">
        
        <div style="max-width:500px; margin:auto; background:white; border-radius:14px; overflow:hidden; box-shadow:0 10px 35px rgba(0,0,0,0.08);">
          
          <div style="background:linear-gradient(135deg,#2563eb,#3b82f6); padding:28px; text-align:center;">
            <h1 style="color:white; margin:0;">Yoo Rental</h1>
            <p style="color:#dbeafe; margin-top:8px;">
              Email Verification
            </p>
          </div>

          <div style="padding:35px 30px;">
            <h2 style="margin-top:0; color:#111827;">
              Verify Your Email
            </h2>

            <p style="color:#4b5563; line-height:1.7;">
              Use the OTP below to complete your registration on Yoo Rental.
            </p>

            <div style="margin:30px 0; text-align:center;">
              <span style="
                display:inline-block;
                background:#eff6ff;
                color:#2563eb;
                font-size:32px;
                font-weight:800;
                letter-spacing:8px;
                padding:18px 30px;
                border-radius:12px;
              ">
                ${otp}
              </span>
            </div>

            <p style="color:#6b7280; font-size:14px;">
              This OTP will expire in 10 minutes.
            </p>

            <p style="color:#6b7280; font-size:14px;">
              If you did not request this email, you can safely ignore it.
            </p>
          </div>

          <div style="padding:18px; text-align:center; background:#f9fafb; color:#9ca3af; font-size:13px;">
            © ${new Date().getFullYear()} Yoo Rental. All rights reserved.
          </div>

        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
