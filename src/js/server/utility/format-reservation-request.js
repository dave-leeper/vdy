const {logError} = require('./log')

module.exports = (json) => {
    let err = `400 Bad Request`
    let text = ``

    if (!json) {
        err += `: No json provided.`
        logError(`${err}`)
        return { status: 400, text: err }
    }
    if (!json.date) {
        err += `: Must provide request date.`
        logError(`${err}`)
        return { status: 400, text: `Must provide request date.` }
    }
    text += `Date: ${json.date}\n`
    if (!json.time) {
        err += `: Must provide request time.`
        logError(`${err}`)
        return { status: 400, text: `Must provide request time.` }
    }
    text += `Time: ${json.time}\n`
    if (!json.firstName || !json.lastName) {
        err += `: Must provide first name and last name.`
        logError(`${err}`)
        return { status: 400, text: `Must provide first name and last name.` }
    }
    text += `Name: ${json.firstName} ${json.lastName}\n`
    if (!json.mobileNumber) {
        err += `: Must provide mobileNumber.`
        logError(`${err}`)
        return { status: 400, text: `Must provide mobileNumber.` }
    }
    text += `Phone: ${json.mobileNumber}\n`
    if (!json.pickupLocation) {
        err += `: Must provide pickup information.`
        logError(`${err}` )
        return { status: 400, text: `Must provide pickup information.` }
    }
    text += `Customer Type: ${json.customerType}\n`
    if (!json.pickupLocation.address && !json.pickupLocation.airport) {
        err += `: Must provide address or airline information.`
        logError(`${err}`)
        return { status: 400, text: `Must provide address or airline information.` }
    }
    text += `\nPickup Information\n`
    if (json.pickupLocation.address) {
        text += `Address: ${json.pickupLocation.address}\n`
        if (json.pickupLocation.address2) { text += `Address2: ${json.pickupLocation.address2}\n` }
        if (!json.pickupLocation.city) {
            err += `: Must provide city information.`
            logError(`${err}`)
            return { status: 400, text: `Must provide city information.` }
        }
        text += `City: ${json.pickupLocation.city}\n`
        if (!json.pickupLocation.state) {
            err += `: Must provide state information.`
            logError(`${err}`)
            return { status: 400, text: `Must provide state information.` }
        }
        text += `State: ${json.pickupLocation.state}\n`
        if (!json.pickupLocation.zip) {
            err += `: Must provide zip code information.`
            logError(`${err}`)
            return { status: 400, text: `Must provide zip code information.` }
        }
        text += `Zip: ${json.pickupLocation.zip}\n`
        if (!json.pickupLocation.date) {
            err += `: Must provide date information.`
            logError(`${err}`)
            return { status: 400, text: `Must provide date information.` }
        }
        text += `Date: ${json.pickupLocation.date}\n`
        if (!json.pickupLocation.time) {
            err += `: Must provide time information.`
            logError(`${err}`)
            return { status: 400, text: `Must provide time information.` }
        }
        text += `Time: ${json.pickupLocation.time}\n`
    } else {
        text += `Airport: ${json.pickupLocation.airport}\n`
        if (!json.pickupLocation.airline) {
            err += `: Must provide airline information.`
            logError(`${err}`)
            return { status: 400, text: `Must provide airline information.` }
        }
        text += `Airline: ${json.pickupLocation.airline}\n`
        if (!json.pickupLocation.flightNumber) {
            err += `: Must provide flight number information.`
            logError(`${err}`)
            return { status: 400, text: `Must provide flight number information.` }
        }
        text += `Flight Number: ${json.pickupLocation.flightNumber}\n`
        if (!json.pickupLocation.arrivalDate) {
            err += `: Must provide arrival date information.`
            logError(`${err}`)
            return { status: 400, text: `Must provide arrival date information.` }
        }
        text += `Arrival Date: ${json.pickupLocation.arrivalDate}\n`
        if (!json.pickupLocation.estimatedArrivalTime) {
            err += `: Must provide estimated arrival time information.`
            logError(`${err}`)
            return { status: 400, text: `Must provide estimated arrival time information.` }
        }
        text += `Estimated Arrival Time: ${json.pickupLocation.estimatedArrivalTime}\n`
    }
    if (!json.dropoffLocation) {
        err += `: Must provide dropoff information.`
        logError(`${err}`)
        return { status: 400, text: `Must provide dropoff information.` }
    }
    text += `\nDropoff Information\n`
    if (json.dropoffLocation.address) {
        text += `Address: ${json.dropoffLocation.address}\n`
        if (json.dropoffLocation.address2) { text += `Address2: ${json.dropoffLocation.address2}\n` }
        if (!json.dropoffLocation.city) {
            err += `: Must provide city information.`
            logError(`${err}`)
            return { status: 400, text: `Must provide city information.` }
        }
        text += `City: ${json.dropoffLocation.city}\n`
        if (!json.dropoffLocation.state) {
            err += `: Must provide state information.`
            logError(`${err}`)
            return { status: 400, text: `Must provide state information.` }
        }
        text += `State: ${json.dropoffLocation.state}\n`
        if (!json.dropoffLocation.zip) {
            err += `: Must provide zip code information.`
            logError(`${err}`)
            return { status: 400, text: `Must provide zip code information.` }
        }
        text += `Zip: ${json.dropoffLocation.zip}\n`
    } else {
        text += `Airport: ${json.dropoffLocation.airport}\n`
        text += `Airline: ${json.dropoffLocation.airline}\n`
    }
    if (json.specialInstructions) { text += `\nSpecial Instructions: ${json.specialInstructions}\n`}

    return { status: 200, text }
}