const nodemailer = require('nodemailer')


module.exports = (handlerName, handlerArgs) => {
    return async (req, res, next) => {
        const formatter = require(handlerArgs.formatter)
        const data = req.body
        const formattedData = formatter(data)

        if (200 !== formattedData.status) {
            res.status(formattedData.status).send(formattedData.text)
            next && next(formattedData.text)
            return
        }
        
        const mailOptions = {
            from: `${process.env.EMAIL_USER}`,
            to: `${process.env.EMAIL_USER}`,
            subject: `Reservation request`,
            text: formattedData.text
        }
        const transporter = nodemailer.createTransport({
            host: `smtp.gmail.com`,
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
        })

        transporter.verify((error, success) => {
            if (error) {
                res.status(500).send(`Failed to send email.`)
                next && next(error)
                return
            } else {
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        res.status(500).send(`Failed to send email.`)
                        next && next(error)
                        return
                    } else {
                        res.status(200).send(`Email sent.`)
                        next && next()
                    }
                })
            }
        })
    }
}
