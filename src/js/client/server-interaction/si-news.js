class SINews {
    static async get() {
        const response = await SI.sendToServer('GET', `news-info`, false, null, null, null)

        return response
    }
    static async add(file, title, text) {
        const body = { title, text }
        const files = [{ name: `filename`, file }]
        const response = await SI.sendToServer('POST', `news-info`, true, null, body, files)

        return response
    }
    static async update(file, title, text, id) {
        const body = { title, text, id }
        const files = [{ name: `filename`, file }]
        const response = await SI.sendToServer('POST', `news-info-update`, true, null, body, files)

        return response
    }
    static async remove(id) {
        const body = { id }
        const response = await SI.sendToServer('DELETE', `news-info`, true, null, body, null)

        return response
    }
}