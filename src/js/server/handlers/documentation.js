const {log, logError} = require(`../utility/log`)
const {getHTMLDoc} = require(`../utility/get-html-doc`)
const {getJSDoc} = require(`../utility/get-js-doc`)

module.exports = (entry) => {
    /**
     * Handles documentation API requests. 
     * 
     * Accepts a request and response object. Checks the doc query parameter to determine which document is requested. 
     * If an HTML doc is requested, calls getHTMLDoc() to retrieve it, stringifies the result, and responds with 200.
     * If a JS doc is requested, calls getJSDoc() to retrieve it, stringifies the result, and responds with 200.
     * If the doc parameter is missing or an unknown type, returns a 400 error.
     * 
     * Any errors are passed to next() if it exists.
    */
    return async (req, res, next) => {
        log(entry)

        const docFunc = async () => {
            const doc = req.query.doc

            if (!doc) {
                const err = `Bad Request No document name provided for document request.`

                logError(err)
                res.status(400).send(err)
                next && next(err)
                return
            }

            if (doc.endsWith(`.html`)) {
                try {
                    const HTMLJSON = await getHTMLDoc(doc)
                    const HTMLDoc = JSON.stringify(HTMLJSON)

                    res.status(200).send(HTMLDoc)
                    next && next()
                } catch (e) { next && next(e) }
            } else if (doc.endsWith(`.js`)) {
                const jsDoc = await getJSDoc(doc)

                res.status(200).send(JSON.stringify(jsDoc))
                next && next()
            } else {
                const err = `Bad Request Unkonen document type. Must end in .html or .js but found ${doc}.`

                logError(err)
                res.status(400).send(err)
                next && next(err)
                return
            }
        }

        docFunc()
    }
}
