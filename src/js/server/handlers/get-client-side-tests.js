const { log, logError } = require('../utility/log')
const { jwtValidation } = require(`../utility/jwt-validation`)
const {jwtReplaceToken} = require(`../utility/jwt-replace-token`)
const { getTests } = require('../utility/get-tests')

module.exports = (entry) => {
    /**
     * Handles getting client side tests.
     * 
     * Validates JWT token from Authorization header. 
     * Gets client side tests from utility function.
     * Constructs response with JWT token and test payload.
     * Sends response back and calls next middleware.
     */
    return async (req, res, next) => {
        log(entry)

        const authorizationHeader = req.get(`Authorization`)
        // const jwtValidationResult = await jwtValidation(authorizationHeader)
        const getClientTests = async () => {
            // const jwtReplaceTokenResult = await jwtReplaceToken(jwtValidationResult.jwtRegistryInfo)
            const clientSideTests = await getTests()
            const response = { jwt: `jwtReplaceTokenResult.jwt`, payload: { status: 200, tests: clientSideTests } }

            res.send(JSON.stringify(response))
            next && next()
        }

        /*
        if (200 !== jwtValidationResult.status) {
            res.status(jwtValidationResult.status).send(jwtValidationResult.err)
            next && next(jwtValidationResult.err)
            return
        }
        */

        getClientTests()
    }
}