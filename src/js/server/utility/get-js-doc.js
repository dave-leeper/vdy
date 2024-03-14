const fs = require(`fs`)
const dox = require('dox')
const {logError} = require('./log')

module.exports.getJSDoc = async (path) => { 
    return new Promise( async ( resolve, reject ) => {
        const text = fs.readFileSync(path, { encoding: `utf8`, flag: `r` })
        const stripEmptyComments = (array, comment) => { 
            if (0 < comment.tags.length && 0 < comment.description.full.length) { 
                array.push(comment)
                return array
            }
            return array
        }
        const clearUnneededFields = (comment) => {
            comment.isPrivate = undefined
            comment.isConstructor = undefined
            comment.isEvent = undefined
            comment.ignore = undefined
            comment.line = undefined
            comment.codeStart = undefined
            comment.code = undefined

            return comment
        }
        const doxOptions = { raw: true }
        const comments = dox.parseComments(text, doxOptions).reduce(stripEmptyComments, [])

        for (let comment of comments) { clearUnneededFields(comment) }

        resolve({  type: `js`, docs: comments, path })
    })
}