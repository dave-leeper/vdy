
const cleanStringify = (str) => {
    let result = JSON.stringify(str)

    result = result.replace(/\'/g,"\\'")                      // Replace ' with \'
    result = result.replace(/"([^"]+(?=":))"/g, "'$1'")         // Replace "name": with 'name':
    result = result.replace(/"/g, "'")                        // Replace " with '
    return result
}
    
