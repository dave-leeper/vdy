const {log, logError} = require(`../utility/log`)
const {stripTests} = require(`../utility/strip-tests`)
const {stripDocs} = require(`../utility/strip-docs`)
const {stripSamples} = require(`../utility/strip-samples`)
const fs = require(`fs`)

const cache = new Map()

module.exports = (entry) => {
    return async (req, res, next) => {
        log(entry)

        if (cache.has(req.url)) { 
            const chechedText = cache.get(req.url) 

            res.status(200).send(chechedText).end()
            return
        }

        let doStripTests = false
        let doStripDocs = false
        let doStripSamples = false
        let url = req.url
        
        if (url.startsWith(`/strip-tests-docs`)) { 
            url = url.replace(`/strip-tests-docs`, `./src`)
            doStripTests = true
            doStripDocs = true
        } else if (url.startsWith(`/strip-tests-samples`)) { 
            url = url.replace(`/strip-tests-samples`, `./src`)
            doStripTests = true
            doStripSamples = true
        } else if (url.startsWith(`/strip-docs-samples`)) { 
            url = url.replace(`/strip-docs-samples`, `./src`)
            doStripDocs = true
            doStripSamples = true
        } else if (url.startsWith(`/strip-tests`)) { 
            url = url.replace(`/strip-tests`, `./src`)
            doStripTests = true
        } else if (url.startsWith(`/strip-docs`)) { 
            url = url.replace(`/strip-docs`, `./src`)
            doStripDocs = true
        } else if (url.startsWith(`/strip-samples`)) { 
            url = url.replace(`/strip-docs`, `./src`)
            doStripSamples = true
        } else if (url.startsWith(`/strip`)) { 
            url = url.replace(`/strip`, `./src`)
            doStripTests = true
            doStripDocs = true
            doStripSamples = true
        }

        let text

        try {
            text = fs.readFileSync(url, { encoding: `utf8`, flag: `r` })
        } catch (e) {
            logError(`Unable to read file`)
            res.status(500).send(`Unable to read file`).end()
            return
        }

        if (doStripTests) { text = stripTests(text) }
        if (doStripDocs) { text = stripDocs(text) }
        if (doStripSamples) { text = stripSamples(text) }

        res.status(200).send(text)
        cache.set(req.url, text)
        next && next()
        return
    }
}
