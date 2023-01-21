const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service: `${process.env.EMAIL_SERVICE}`,
    auth: {
      user: `${process.env.EMAIL_USER}`,
      pass: `${process.env.EMAIL_PASSWORD}`
    }
})

module.exports = (handlerName, handlerArgs) => {
    return async (req, res, next) => {
        const formatter = require(handlerArgs.formatter)
        const data = req.body
        const formattedData = formatter(data)

        if (200 !== formattedData.status) {
            console.log(formattedData.text)
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

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                res.status(500).send(`Failed to send email.`)
                next && next(error)
            } else {
                res.status(200).send(`Email sent.`)
                next && next()
            }
        })
    }
}
