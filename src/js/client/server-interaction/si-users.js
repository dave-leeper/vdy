class SIUsers {
    static async login(userName, password) {
        const login = { name: userName, password }
        const response = await SI.sendToServer('POST', `login-attempt`, false, null, login, null)

        return response
    }
    static async get() {
        const response = await SI.sendToServer('GET', `user-info`, false, null, null, null)

        return response
    }
    static async add(userName, password, roles, title, firstName, lastName, file) {
        const body = { userName, password, roles, firstName, lastName, title }
        const files = [{ name: `filename`, file }]
        const response = await SI.sendToServer('POST', `user-info`, true, null, body, files)

        return response
    }
    static async update(userName, password, roles, title, firstName, lastName, file, id) {
        const body = { userName, password, roles, firstName, lastName, title, id }
        const files = [{ name: `filename`, file: file }]
        const response = await SI.sendToServer('POST', `user-info-update`, true, null, body, files)

        return response
    }
    static async remove(id) {
        const body = { id }
        const response = await SI.sendToServer('DELETE', `user-info`, true, null, body, null)

        return response
    }
}