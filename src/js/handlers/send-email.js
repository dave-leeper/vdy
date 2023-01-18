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
        const data = req.body.data
        // TODO: Add a data formatter tothe handler args that formats the incoming JSON.
        let text = `Name: ${data.firstName} ${data.lastname}
Phone: ${data.mobileNumber}
Pickup: ${data.pickupLocation}
Dropoff: ${data.dropoffLocation}
Special Instructions: ${data.specialInstructions}`
        const mailOptions = {
            from: `${process.env.EMAIL_USER}`,
            to: `${process.env.EMAIL_USER}`,
            subject: `Reservation request`,
            text
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
