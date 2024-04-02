const fs = require(`fs`)
const dox = require('dox')
const {logError} = require('./log')

/**
 * Parses HTML text to extract script tags and metadata. 
 * 
 * Returns an array of objects containing the script text, 
 * and booleans indicating if the script is a test or sample.
 */
const getScripts = (text) => {
    const scripts = []
    const index = text.indexOf(`<script`)

    while (-1 !== index) {
        const closeIndex = text.indexOf(`>`)
        const endIndex = text.indexOf(`</script>`)

        if (-1 === closeIndex || -1 === endIndex) { return scripts }
        if (closeIndex > endIndex) { return scripts }

        const workingtext = text.substring(closeIndex + 1, endIndex)
        const tag = text.substring(index, closeIndex)
        const isTest = -1 !== tag.indexOf(`data-is-test`)
        const isSample = -1 !== tag.indexOf(`data-is-sample`)
        const isCode = !isTest && !isSample
        const scriptInfo = { text: workingtext, isTest, isSample, isCode }

        scripts.push(scriptInfo)
    }
    return scripts
}
/**
 * Counts the number of script objects in the provided array that have 
 * the isTest property set to true.
 * 
 * @param {Object[]} scripts - Array of script objects
 * @returns {number} The number of test scripts
 */
const getTestCount = (scripts) => {
    let testCount = 0

    for (let script of scripts) { if (script.isTest) { testCount++ } }
    return testCount
}
/**
 * Counts the number of script objects in the provided array that have
 * the isSample property set to true.
 *
 * @param {Object[]} scripts - Array of script objects  
 * @returns {number} The number of sample scripts
 */
const getSampleCount = (scripts) => {
    let sampleCount = 0

    for (let script of scripts) { if (script.isSample) { sampleCount++ } }
    return sampleCount
}
/**
 * Counts the number of script objects in the provided array that have 
 * the isCode property set to true.
 *
 * @param {Object[]} scripts - Array of script objects
 * @returns {number} The number of code scripts
 */
const getCodeCount = (scripts) => {
    let codeCount = 0

    for (let script of scripts) { if (script.isCode) { codeCount++ } }
    return codeCount
}


module.exports.getHTMLDoc = async (path) => { 
    return new Promise( async ( resolve, reject ) => {
        const text = fs.readFileSync(path, { encoding: `utf8`, flag: `r` })
        const scripts = getScripts(text)
        let docs = []
        let testDocs = []

        if (0 === scripts.length) {
            const result = { docs, testDocs, path } 

            resolve(result)
            return
        }
        if (1 < getTestCount(scripts)) {
            const err = `500 Internal Server Error. Multiple test scripts found.`

            logError(err)
            reject(err)
            return
        }
        if (1 < getSampleCount(scripts)) {
            const err = `500 Internal Server Error. Multiple sample scripts found.`

            logError(err)
            reject(err)
            return
        }
        if (1 < getCodeCount(scripts)) {
            const err = `500 Internal Server Error. Multiple code scripts found.`

            logError(err)
            reject(err)
            return
        }

        /**
         * Removes empty comments from the provided array by checking if the 
         * comment has tags and a non-empty description.
         * 
         * @param {Object[]} array - Array of comment objects 
         * @param {Object} comment - The comment object to check
         * @returns {Object[]} The updated array with empty comments removed
         */
        const stripEmptyComments = (array, comment) => {
            if (0 < comment.tags.length && 0 < comment.description.full.length) {
                array.push(comment)
                return array
            }
            return array
        }
        /**
         * Removes unneeded fields from the comment object.
         * 
         * This clears out fields that are set during parsing but not needed for output.
         * 
         * @param {Object} comment - The comment object to update 
         * @returns {Object} The updated comment object without unneeded fields
         */
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
        /**
         * Parses and evaluates a test script, returning test suite documentation.
         * 
         * Takes a test script string, evals it to get the test suite function, 
         * calls the function to get the test suite object, and returns documentation 
         * for the test suite name, description, and individual tests.
         * 
         * Returns null if there is an error parsing or evaluating the script.
        */
        const readTestScript = (script) => {
            if (!script || 0 === script.trim().length) { return [] }
            try {
                const testSuiteFunc = eval(`() => { ${script} }`)
                const testSuite = testSuiteFunc()
                const suiteDoc = { name: testSuite.name, description: testSuite.description, tests: [] }

                for (let test of testSuite.tests) {
                    const testDoc = { name: test.name, description: test.description }

                    suiteDoc.tests.push(testDoc)
                }
                return suiteDoc
            } catch (e) {
                const err = `500 Internal Server Error. Could not parse test script at ${path}.`
                logError(e)
                reject(err)
                return null
            }
        }
        const doxOptions = { raw: true }

        for (let script of scripts) {
            let comments

            if (script.isTest) {
                comments = readTestScript(script)
                if (null === comments) { return }
                testDocs = comments
            } else if (script.isCode) {
                comments = dox.parseComments(script, doxOptions).reduce(stripEmptyComments, [])
                for (let comment of comments) { clearUnneededFields(comment) }
                docs = comments
            }
    
        }

        /**
         * Gets the class comment from an array of comments.
         * 
         * Loops through the provided commentArray and returns 
         * the first comment that has isClass set to true.
         * Returns null if no class comment is found.
         */
        const getClassComment = (commentArray) => {
            for (let comment of commentArray) { if (comment.isClass) { return comment } }
            return null
        }
        /**
         * Gets all function comments from an array of comments. 
         * 
         * Loops through the provided commentArray and returns 
         * an array containing all comments that have a tag with type "function".
         * 
         * @param {Object[]} commentArray - Array of comment objects to search.
         * @returns {Object[]} Array of comment objects that have function tags.
        */
        const getClassFunctionComments = (commentArray) => {
            const functionComments = []

            for (let comment of commentArray) { for (let tag of comment.tags) { if (`function` === tag.type) { functionComments.push(comment) } } }
            return functionComments
        }
        /**
         * Gets the variable comment from an array of comments.
         * 
         * Loops through the provided commentArray and returns
         * the first comment that is for a variable.
         * Returns null if no variable comment is found.
         */
        const getVarComment = (commentArray) => {
            for (let comment of commentArray) {
                if (!commentHasTag(comment, `member`)) { continue }

                const memberName = commentHasTag(comment, `name`)

                if (`vars` !== memberName.string) { continue }
                return comment
            }
            return null
        }
        /**
         * Gets the prop comment from an array of comments.
         * 
         * Loops through the provided commentArray and returns
         * the first comment for a prop. 
         * Returns null if no prop comment is found.
         */
        const getPropComment = (commentArray) => {
            for (let comment of commentArray) {
                if (!commentHasTag(comment, `member`)) { continue }

                const memberName = commentHasTag(comment, `name`)

                if (`props` !== memberName.string) { continue }
                return comment
            }
            return null
        }
        /**
         * Gets the param tags from a function comment.
         * 
         * Loops through the tags in the provided comment 
         * and returns an array containing any tags of type "param".
         * 
         * @param {Object} comment - The function comment object to get param tags from.
         * @returns {Object[]} Array containing the param tags.
        */
        const getFunctionCommentParamTags = (comment) => {
            const paramTags = []

            for (let tag of comment.tags) { if (`param` === tag.type) { paramTags.push(tag) } }
            return paramTags
        }
        /**
         * Gets the fires tags from a function comment.
         * 
         * Loops through the tags in the provided comment
         * and returns an array containing any tags of type "fires".
         * 
         * @param {Object} comment - The function comment object to get fires tags from.
         * @returns {Object[]} Array containing the fires tags.
         */
        const getFunctionCommentFiresTags = (comment) => {
            const paramTags = []

            for (let tag of comment.tags) { if (`fires` === tag.type) { paramTags.push(tag) } }
            return paramTags
        }
        /**
         * Gets the listens tags from a function comment.
         * 
         * Loops through the tags in the provided comment
         * and returns an array containing any tags of type "listens".
         * 
         * @param {Object} comment - The function comment object to get listens tags from.
         * @returns {Object[]} Array containing the listens tags.
         */
        const getFunctionCommentListensTags = (comment) => {
            const paramTags = []

            for (let tag of comment.tags) { if (`listens` === tag.type) { paramTags.push(tag) } }
            return paramTags
        }
        /**
         * Checks if the given comment has a tag with the specified name.
         * 
         * Loops through the tags in the provided comment and returns the tag
         * if one exists with the given tagName. Returns false if no match found.
         * 
         * @param {Object} comment - The comment object to check.
         * @param {string} tagName - The tag name to look for.
         * @returns {Object|boolean} The tag object if found, false otherwise.
         */
        const commentHasTag = (comment, tagName) => {
            for (let tag of comment.tags) { if (tagName === tag.type) { return tag } }
            return false
        }
        /**
         * Gets the value of the tag with the given tagName from the comment.
         * 
         * Loops through the tags in the provided comment and returns the string value
         * of the first tag that matches the provided tagName. Returns null if no match.
         * 
         * @param {Object} comment - The comment object to search.
         * @param {string} tagName - The tag name to look for.
         * @returns {string|null} The string value of the matching tag, or null.
         */
        const getTagValue = (comment, tagName) => {
            for (let tag of comment.tags) { if (tagName === tag.type) { return tag.string } }
            return null
        }
        const classComment = getClassComment(docs)
        const className = classComment?.ctx.name
        const classExtends = classComment?.ctx.extends
        const classMethodComments = getClassFunctionComments(docs)
        const classData = {
            name: className,
            extends: classExtends,
            description: classComment?.description.full,
            methods: []
        }

        if (classMethodComments && 0 < classMethodComments.length) {
            for (let classFunctionComment of classMethodComments) {
                const isStatic = commentHasTag(classFunctionComment, `static`)
                const isAsync = commentHasTag(classFunctionComment, `async`)
                const functionName = commentHasTag(classFunctionComment, `name`)? getTagValue(classFunctionComment, `name`) : `No name provided`
                const params = getFunctionCommentParamTags(classFunctionComment)
                const fires = getFunctionCommentFiresTags(classFunctionComment)
                const listens = getFunctionCommentListensTags(classFunctionComment)
                const methodData = {
                    name: functionName,
                    isStatic: !!isStatic,
                    isAsync: !!isAsync,
                    description: classFunctionComment.description.full,
                    params: [],
                    fires,
                    listens
                }

                for (let loop = 0; loop < params.length; loop++) {
                    const param = params[loop]
                    const name = param.name
                    const description = param.description
                    const optional = param.optional
                    const types = param.types
                    const paramData = {
                        name,
                        optional,
                        description,
                        types
                    }

                    methodData.params.push(paramData)
                }
                classData.methods.push(methodData)
            }
        }

        const varComment = getVarComment(docs)

        if (varComment) {
            const varData = {
                properties: []
            }

            for (let tag of varComment.tags) {
                if (`property` !== tag.type) { continue }

                const propertyName = tag.name
                const propertyType = tag.types.join(` | `)
                const propertyDescription = tag.description
                const propertydata = {
                    name: propertyName,
                    type: propertyType,
                    description: propertyDescription
                }

                varData.properties.push(propertydata)
            }
            classData.vars = varData
        }

        const propsComment = getPropComment(docs)

        if (propsComment) {
            const propsData = {
                properties: []
            }

            for (let tag of propsComment.tags) {
                if (`property` !== tag.type) { continue }

                const propertyName = tag.name
                const propertyType = tag.types.join(` | `)
                const propertyDescription = tag.description
                const propertydata = {
                    name: propertyName,
                    type: propertyType,
                    description: propertyDescription
                }

                propsData.properties.push(propertydata)
            }
            classData.props = propsData
        }
        const result = { type: `html`, docs: classData, testDocs, path } 

        resolve(result)
    })
}