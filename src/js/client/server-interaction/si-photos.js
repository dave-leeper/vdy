class SIPhotos {
    static async get() {
        const response = await SI.sendToServer('GET', `photo-info`, false, null, null, null)

        return response
    }
    static async add(file, text) {
        const body = { text }
        const files = [{ name: `filename`, file }]
        const response = await SI.sendToServer('POST', `photo-info`, true, null, body, files)

        return response
    }
    static async update(file, text, id) {
        const body = { text, id }
        const files = [{ name: `filename`, file }]
        const response = await SI.sendToServer('POST', `photo-info-update`, null, true, body, files)

        return response
    }
    static async remove(id) {
        const body = { id }
        const response = await SI.sendToServer('DELETE', `photo-info`, true, null, body, null)

        return response
    }
}