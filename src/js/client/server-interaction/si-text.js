class SIText {
    static async get() {
        const response = await SI.sendToServer('GET', `text-info`, false, null, null, null)

        return response
    }
    static async update(text, id) {
        const body = { text, id }
        const response = await SI.sendToServer('POST', `text-info-update`, true, null, body, null)

        return response
    }
}