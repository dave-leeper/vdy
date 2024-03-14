class SIDocs {
    static async getDocs() {
        const response = await SI.sendToServer('GET', `docs-list`, false, null, null, null, null, null)

        return response
    }
    static async getDoc(path) {
        const response = await SI.sendToServer('GET', `document?doc=${path}`, false, null, null, null, null, null)

        return response
    }
    
}