const fs = require(`fs`)
const dox = require('dox')
const {logError} = require('./log')

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
const getTestCount = (scripts) => {
    let testCount = 0

    for (let script of scripts) { if (script.isTest) { testCount++ }}
    return testCount
}
const getSampleCount = (scripts) => {
    let sampleCount = 0

    for (let script of scripts) { if (script.isSample) { sampleCount++ }}
    return sampleCount
}
const getCodeCount = (scripts) => {
    let codeCount = 0

    for (let script of scripts) { if (script.isCode) { codeCount++ }}
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

        const getClassComment = (commentArray) => { 
            for (let comment of commentArray) { if (comment.isClass) { return comment }}
            return null
        }
        const getClassFunctionComments = (commentArray) => {
             const functionComments = []
 
            for (let comment of commentArray) { for (let tag of comment.tags) { if (`function` === tag.type) { functionComments.push(comment) }}}
            return functionComments
        }
        const getVarComment = (commentArray) => {
             for (let comment of commentArray) { 
                 if (!commentHasTag(comment, `member`)) { continue }
                 
                 const memberName = commentHasTag(comment, `name`)
 
                 if (`vars` !== memberName.string) { continue }
                 return comment
             }
            return null
        }
        const getPropComment = (commentArray) => {
             for (let comment of commentArray) { 
                 if (!commentHasTag(comment, `member`)) { continue }
                 
                 const memberName = commentHasTag(comment, `name`)
 
                 if (`props` !== memberName.string) { continue }
                 return comment
             }
            return null
        }
        const getFunctionCommentParamTags = (comment) => {
            const paramTags = []

           for (let tag of comment.tags) { if (`param` === tag.type) { paramTags.push(tag) }}
           return paramTags
       }
       const getFunctionCommentFiresTags = (comment) => {
            const paramTags = []

            for (let tag of comment.tags) { if (`fires` === tag.type) { paramTags.push(tag) }}
            return paramTags
        }
        const getFunctionCommentListensTags = (comment) => {
            const paramTags = []

            for (let tag of comment.tags) { if (`listens` === tag.type) { paramTags.push(tag) }}
            return paramTags
        }
        const commentHasTag = (comment, tagName) => {
            for (let tag of comment.tags) { if (tagName === tag.type) { return tag }}
            return false
        }
        const getTagValue = (comment, tagName) => {
            for (let tag of comment.tags) { if (tagName === tag.type) { return tag.string }}
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