const nodemailer = require('nodemailer');
const pug = require('pug')
const htmlToText = require('html-to-text')
// new Email(user, url).sendWelcome()
module.exports = class Email {
    constructor(user,url) {
        this.to = user.email
        this.firstName=user.name.split(' ')[0]
        this.url = url
        this.from = `Aleks Shatoh<${process.env.EMAIL_FROM}`
    }
    newTransport(){
        if(process.env.NODE_ENV==='production'){
            return 1
        }
        return nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port:2525,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
            //Activate in gmail less secure app option
        })
    }
         //Send the actual email
    async send(template, subject) {
        console.log(this)
    //1)Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
        firstName: this.firstName,
        url: this.url,
        subject
    })

    //2) Define emailOptions
    const mailOptions = {
        from: this.from,
        to: this.to,
        html,
        subject,
        text: htmlToText.fromString(html),
        // html: 
    }
    //3) CreateTransport ans send email
    this.newTransport()
    await  this.newTransport().sendMail(mailOptions)   
    }

    async sendWelcome() {
      await   this.send('welcome', 'welcome to the natours family')
    };
    async sendPasswordReset() {
        await this.send('passWord reset', 'your password reset token valid only 10 minutes')
    }
}



