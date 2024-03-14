// https://miracleio.me/snippets/use-gmail-with-nodemailer/
const nodemailer = require('nodemailer')
const {logError} = require('../utility/log')

module.exports.sendEmail = async (body, subject, from, to, password) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from,
            to,
            subject,
            text: body
        }
        const transporter = nodemailer.createTransport({
            host: `smtp.gmail.com`,
            port: 465,
            secure: true,
            auth: {
                user: from,
                pass: password
            }
        })
    
        transporter.verify((error, success) => {
            if (error) {
                const err = `500 Internal Server Error`
    
                logError(`${err} Failed to send email. Transporter verification failed.`)
                reject({ status: 500, text: err })
            } else {
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        const err = `500 Internal Server Error`
    
                        logError(`${err} Failed to send email.`)
                        reject({ status: 500, text: err })
                    } else {
                        resolve({ status: 200, text: `Success` })
                    }
                })
            }
        })
    })
}
