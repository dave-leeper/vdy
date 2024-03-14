class SITesting {
    static async getList() {
        const response = await SI.sendToServer('GET', `client-tests`, false, null, null, null, null, null)

        return response
    }
}