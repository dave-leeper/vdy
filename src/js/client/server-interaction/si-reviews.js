class SIReviews {
    static async get(page, pageSize) {
        const response = await SI.sendToServer('GET', `reviews`, false, null, null, null, page, pageSize)

        return response
    }
    static async add(review) {
        const response = await SI.sendToServer('POST', `add-review`, false, null, review, null)

        return response
    }
}