class SILogs {
    static async getLog() {
        const response = await SI.sendToServer('GET', `log`, true, null, null, null)

        return response
    }
    static async getErrors() {
        const response = await SI.sendToServer('GET', `errors`, true, null, null, null)

        return response
    }
}