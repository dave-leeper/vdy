class SIReservations {
    static async get() {
        const response = await SI.sendToServer('GET', `reservations`, true, null, null, null)

        return response
    }
    static async add(reservation) {
        const response = await SI.sendToServer('POST', `request-reservation`, false, null, reservation, null)

        return response
    }
    static async remove(reservationId) {
        const body = { id: reservationId }
        const response = await SI.sendToServer('DELETE', `reservation`, true, null, body, null)

        return response
    }
}