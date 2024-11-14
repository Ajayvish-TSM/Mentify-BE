const config = require("../../config.json");
const nodemailer = require("nodemailer");

class Mail {
  constructor() {
    console.log("Initializing Mail object...");
    this.transporter = nodemailer.createTransport({
      host: config.MAIL.HOST,
      port: 465, // Ensuring the port is an integer

      auth: {
        user: "abhayagnihotri1585@gmail.com",
        pass: "kvszcwmlljzxdnia",
      },

      service: "gmail",
    });
  }

  async sendMail(mailOptions) {
    try {
      console.log("Sending email...");
      const info = await this.transporter.sendMail({
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      console.log("Email sent successfully:", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

module.exports = Mail;
