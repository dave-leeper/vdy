const { listDirectory, isDirectory } = require(`./directory`)
const fs = require(`fs`)

module.exports.getTests = async () => { 
    return new Promise( async ( resolve, reject ) => {
        const checkForTestScript = (path) => {
            const text = fs.readFileSync(path, { encoding: `utf8`, flag: `r` })
            const scriptTagRegEx = /<script\sdata-is-test\s?=\s?"true"\s?>/

            return scriptTagRegEx.test(text)
        }
        const getFileList = async (path, suffix, validationCallback) => {
            const files = await listDirectory(path)
            let result = []

            for (let file of files) { 
                const fullPath = `${path}/${file}`
                const isDir = await isDirectory(fullPath)
    
                if (isDir) {
                    const subDirResults = await getFileList(fullPath, suffix)

                    result = result.concat(subDirResults)
                } else {
                    if (!file.endsWith(suffix)) { continue }
                    if (validationCallback) { if (!validationCallback(fullPath)) { continue }}

                    result.push(fullPath.replace(`./src`, `.`))
                }
            }
            return result
        }

        const js = await getFileList(process.env.JAVASCRIPT_CLIENT_TEST_DIRECTORY, `.js`)
        const html = await getFileList(process.env.HTML_TEST_DIRECTORY, `.html`, checkForTestScript)
        const result = { js, html }

        resolve(result)
    })
}