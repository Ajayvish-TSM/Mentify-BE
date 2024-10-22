const config = require('../../config.json');
const nodemailer = require('nodemailer');
class mail {
    constructor() { console.log("init Mail object"); }

    async setUpSMTP() {

        console.log("init SMTP process");
        return await nodemailer.createTransport({
            host: config.MAIL.HOST,
            port: config.MAIL.PORT,
            service: 'Gmail',
            auth: {
                user: config.MAIL.USER, // generated ethereal user
                pass: config.MAIL.PASSWORD, // generated ethereal password
            },
        });
    }

    async sendMail(mail) {

        const transporter = await this.setUpSMTP();
        console.log("init mail process", transporter);
        return await transporter.sendMail(mail);
        /*{
            from: `${mail.from}`,//'"Fred Foo 👻" <foo@example.com>', // sender address
            to: `${mail.to}`,//"bar@example.com, baz@example.com", // list of receivers
            subject: `${mail.subject}`, // Subject line
            // text: "Hello world?", // plain text body
            html: `${mail.html}`, // html body
        });*/
    }


}

module.exports = mail;