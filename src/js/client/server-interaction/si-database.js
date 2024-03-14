class SIDatabase {
    static async getDatabase() {
        const response = await SI.sendToServer('GET', `database`, true, null, null, null)

        return response
    }
}