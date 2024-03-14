const timeAsHHMMSS = (optionalDate) => {
    const pad = (i) => { return (i < 10) ? "0" + i : i }
    const date = (optionalDate)? optionalDate : new Date()
    const hour = pad(date.getHours())
    const minute = pad(date.getMinutes())
    const second = pad(date.getSeconds())

    return `${hour}:${minute}:${second}`
}



