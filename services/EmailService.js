const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    type: "login",
    user: "nodeapp53@gmail.com",
    pass: "yxhv kxwc etcw mchy",
  },
});

class EmailService {
  static async sendOTP(user, emailContent) {
    try {
      const mailOptions = {
        from: '"Stride" <nodeapp53@gmail.com>',
        to: user.email,
        subject: "Password Reset OTP Code",
        html: emailContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`OTP code sent to ${user.email}: ${info.response}`);
    } catch (error) {
      console.error("Error sending OTP code:", error);
    }
  }
}

module.exports = EmailService;
