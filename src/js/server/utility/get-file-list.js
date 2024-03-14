const { listDirectory, isDirectory } = require(`./directory`)
const {logError} = require('./log')

module.exports.getFileList = async (path, suffix, recursive) => { 
    return new Promise( async ( resolve, reject ) => {
        const getList = async (path, suffix, recursive) => {
            const files = await listDirectory(path)
            let result = []

            for (let file of files) { 
                const fullPath = `${path}/${file}`
                const isDir = await isDirectory(fullPath)
    
                if (isDir) {
                    if (recursive) {
                        const subDirResults = await getList(fullPath, suffix, recursive)

                        result = result.concat(subDirResults)
                    }
                } else {
                    if (!file.endsWith(suffix)) { continue }
                    result.push(fullPath)
                }
            }
            return result
        }

        try {
            const fileList = await getList(path, suffix, recursive)

            resolve(fileList)
        } catch(e) {
            const err = `Error retriveing file list. Path: ${path} Suffix: ${suffix} Recursive: ${recursive} Error: ${JSON.stringify(e)}`

            logError(err)
            reject(err)
        }

    })
}