const {surrealDBChange, surrealDBSelect} = require(`../database/surrealdb`)
const Registry = require(`../registry`)

module.exports = (name, args) => {
    return async (req, res, next) => {
        let db = Registry.get(`SurrealDBConnection`)
        const authorizationHeader = req.get(`Authorization`)
        const requestBody = req.body
        
        if (!db) {
            const err = `503 Service Unavailable`
            const result = { status: 503, err }

            console.error(err + `: Database not available.`)
            res.status(result.status).send(JSON.stringify(result))
            next && next(err)
            return
        }
        if (!requestBody) {
            const err = `400 Bad Request`
            const result = { status: 400, err }

            console.error(err + `: No reply found in request body.`)
            res.status(result.status).send(err)
            next && next(err)
            return
        }

        try {
            let review = await surrealDBSelect(db, requestBody.id)
            let updateData = {}
            
            updateData.funnyCount = review.funnyCount + 1
            await surrealDBChange(db, requestBody.id, updateData)
    
            res.status(200).send(JSON.stringify(requestBody))

            review = await surrealDBSelect(db, requestBody.id)
            next && next()
        } catch (e) {
            const err = `503 Service Unavailable`
            const result = { status: 503, err }

            console.error(err + `: Database update failed.`)
            res.status(result.status).send(JSON.stringify(result))
            next && next(err)
            return
        }

    }
}
