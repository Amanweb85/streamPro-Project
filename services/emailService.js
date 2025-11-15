const transporter = require("../config/mailer"); // Import the configured mailer

/**
 * Sends a verification OTP to a user's email address.
 */
const sendOtpEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"StreamPro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: `<div style="font-family: sans-serif;">
                     <h2>Email Verification</h2>
                     <p>Thank you for signing up. Your one-time verification code is:</p>
                     <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otp}</p>
                     <p>This code will expire in 10 minutes.</p>
                     <p>${Date().split("GMT")[0]}</p>
                   </div>`,
    });
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending OTP email to ${email}:`, error);
    // Depending on your app's needs, you might want to throw the error
    // so the controller knows the email failed to send.
    throw new Error("Failed to send verification email.");
  }
};

module.exports = {
  sendOtpEmail,
};

// sendOtpEmail("amanverma6789012@gmail.com", "123456")
//   .then(() => console.log("Test finished successfully."))
//   .catch((err) => console.error("Test failed:", err));
