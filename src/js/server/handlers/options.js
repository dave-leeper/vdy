const {log, logError} = require('../utility/log')

module.exports = (entry) => {
    /**
     * Handler for OPTIONS requests to this route.
     * 
     * Logs the request entry point using the provided log utility.
     * Responds with a 200 status and passes execution to the next handler.
     */
    return async (req, res, next) => {
        log(entry)

        res.status(200).send()
        next && next()
    }
}
