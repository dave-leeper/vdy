const {surrealDBSelect} = require(`../database/surrealdb`)
const Registry = require(`../registry`)
var atob = require('atob');

module.exports.jwtValidation = async (authorizationHeader) => {
    //vvvvvvvvvvvvvvvvvv
    // Temp code for testing
    // TODO: Remove this testing code
    const registryEntry = { expires: new Date().subtractHours(1), name: `Admin`, roles: [`Admin`], image: `generic-avatar` }
    Registry.register(registryEntry, `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ2ZHkiLCJyb2xlcyI6WyJBZG1pbiJdLCJpYXQiOjE2NzI2MzA0MTF9.-kS8LqAnwswCCinDeJubfNpHcjQltPOC68rGBR6IizE`)
    // ^^^^^^^^^^^^^^^^^

    const jwt = Registry.get(`JWT`)
    const jwtToken = authorizationHeader.substring(7, authorizationHeader.length)
    const jwtRegistryInfo = Registry.get(jwtToken)
    const now = new Date()
    const expires = Date.parse(jwtRegistryInfo.expires)
    
    if (!jwt) {
        const err = `503 Service Unavailable`

        console.error(err + `: Javascript Web Token service not available.`)
        return { status: 503, err }
    }
    if (!authorizationHeader.startsWith("Bearer ")) {
        const err = `401 Unauthorized`

        console.error(err + `: Authorization header has an invalid format.`)
        return { status: 401, err }
    }
    if (!jwtRegistryInfo) {
        const err = `401 Unauthorized`

        console.error(err + `: Unknown JWT token.`)
        return { status: 401, err }
    }
    if (now > expires) {
        const err = `401 Unauthorized`

        Registry.unregister(jwtToken)
        console.error(err + `: JWT token has expired.`)
        return { status: 401, err }
    }
    return { status: 200, err: null }
}
