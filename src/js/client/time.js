/**
 * Formats a date into a string with the time formatted as HH:MM:SS. 
 * If no date is provided, defaults to the current time.
 * 
 * @param {Date} [optionalDate] - The date to format. If not provided, defaults to now.
 * @returns {string} The formatted time string.
 */
const timeAsHHMMSS = (optionalDate) => {
    const pad = (i) => { return (i < 10) ? "0" + i : i }
    const date = (optionalDate) ? optionalDate : new Date()
    const hour = pad(date.getHours())
    const minute = pad(date.getMinutes())
    const second = pad(date.getSeconds())

    return `${hour}:${minute}:${second}`
}



