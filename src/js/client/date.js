const dateAsMMDDYYY = (optionalDate) => {
    const date = (optionalDate)? optionalDate : new Date()
    const yyyy = date.getFullYear()
    let mm = date.getMonth() + 1 // Months start at 0!
    let dd = date.getDate()

    if (dd < 10) { dd = '0' + dd }
    if (mm < 10) { mm = '0' + mm }

    const formattedDate = mm + '/' + dd + '/' + yyyy

    return formattedDate
}