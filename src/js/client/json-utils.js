
/**
 * Sanitizes a JSON string by escaping quotes and replacing double quotes with single quotes.
 *
 * @param {string} str - The JSON string to sanitize.
 * @returns {string} The sanitized JSON string.
 */
const cleanStringify = (str) => {
    let result = JSON.stringify(str)

    result = result.replace(/\'/g, "\\'")                      // Replace ' with \'
    result = result.replace(/"([^"]+(?=":))"/g, "'$1'")         // Replace "name": with 'name':
    result = result.replace(/"/g, "'")                        // Replace " with '
    return result
}
    
