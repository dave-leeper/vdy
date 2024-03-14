class SIAnalytics {
    static async get() {
        const response = await SI.sendToServer('GET', `analytics`, true, null, null, null)

        return response
    }
    static async incrementHomePageCounter() {        
        const result = await SIAnalytics.incrementCounter(`increment-home-page-counter`)

        return result
    }
    static async incrementReservationPageCounter() {        
        const result = await SIAnalytics.incrementCounter(`increment-reservation-page-counter`)

        return result
    }
    static async incrementReservationRequestCounter() {        
        const result = await SIAnalytics.incrementCounter(`increment-reservation-request-counter`)

        return result
    }
    static async incrementReservationRequestInvalidDataCounter() {        
        const result = await SIAnalytics.incrementCounter(`increment-reservation-request-invalid-data-counter`)

        return result
    }
    static async incrementReservationRequestFailedCounter() {        
        const result = await SIAnalytics.incrementCounter(`increment-reservation-request-failed-counter`)

        return result
    }
    static async incrementQuoteRequestCounter() {        
        const result = await SIAnalytics.incrementCounter(`increment-quote-request-counter`)

        return result
    }
    static async incrementQuoteRequestInvalidDataCounter() {        
        const result = await SIAnalytics.incrementCounter(`increment-quote-request-invalid-data-counter`)

        return result
    }
    static async incrementQuoteRequestFailedCounter() {        
        const result = await SIAnalytics.incrementCounter(`increment-quote-request-failed-counter`)

        return result
    }
    static async incrementPhotosPageCounter() {        
        const result = await SIAnalytics.incrementCounter(`increment-photos-page-counter`)

        return result
    }
    static async incrementReviewsPageCounter() {
        const result = await SIAnalytics.incrementCounter(`increment-reviews-page-counter`)

        return result
    }
    static async incrementCounter(counterURL) {  
        const response = await SI.sendToServer('POST', counterURL, false, null, null, null)

        return response
    }
}