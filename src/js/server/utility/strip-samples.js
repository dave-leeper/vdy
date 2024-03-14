module.exports.stripSamples = (originalText) => {
    const scriptTagRegEx = /<script\s+data-is-sample\s*=\s*"true"\s*>/
    let text = originalText
    const index = text.search(scriptTagRegEx)

    if (-1 !== index){
        const part1 = text.substring(0, index)
        const secondHalfOfText = text.substring(index)
        const index2 = secondHalfOfText.indexOf(`</script>`) + 9
        const part2 = secondHalfOfText.substring(index2)
        
        text = part1 + part2
    }
    return text
}
