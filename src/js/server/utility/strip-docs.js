const Comments = require(`parse-comments`);

module.exports.stripDocs = (originalText) => {
    const comments = new Comments()
    const ast = comments.parse(originalText)
    let text = ``
    let loc = 0

    for (let commentAST of ast) {
        const commentStart = commentAST.range[0]
        const commentEnd = commentAST.range[1]
        const slice = originalText.substring(loc, commentStart)

        loc = commentEnd + 1
        text += slice
    }
    text += originalText.substring(loc)
    return text
}
