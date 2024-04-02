const {log, logError} = require('../utility/log')

module.exports = (entry) => {
    /**
     * Handler for text route.
     * 
     * @param {Object} req - Express request object 
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * 
     * Logs the entry data and sends the text from the request body back in the response.
     * Calls next() if it exists.
     */
    return async (req, res, next) => {
        log(entry)

        res.send(entry.args.text)
        next && next()
    }
}
