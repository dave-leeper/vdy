class SIReply {
    static async get() {
        const response = await SI.sendToServer('GET', `replies`, false, null, null, null)

        return response
    }
    static async add(reply) {
        const response = await SI.sendToServer('POST', `reply`, false, null, reply, null)

        return response
    }
    static async update(reply, id) {
        const body = { reply, id }
        const response = await SI.sendToServer('POST', `replies-update`, true, null, body, null)

        return response
    }
    static async remove(replyId) {
        const body = { id: replyId }
        const response = await SI.sendToServer('DELETE', `reply`, true, null, body, null)

        return response
    }

}