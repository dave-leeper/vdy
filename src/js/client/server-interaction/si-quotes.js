class SIQuotes {
    static async get() {
        const response = await SI.sendToServer('GET', `quotes`, true, null, null, null)

        return response
    }
    static async add(quote) {
        const response = await SI.sendToServer('POST', `request-quote`, false, null, quote, null)

        return response
    }
    static async remove(quoteId) {
        const body = { id: quoteId }
        const response = await SI.sendToServer('DELETE', `quote`, true, null, body, null)

        return response
    }
}