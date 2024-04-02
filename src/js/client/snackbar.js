/**
 * Shows an error snackbar with the provided message. 
 * Logs the error message and shows a snackbar component with the error text.
*/
const showError = (message) => {
    let errorSnackbar = Component.getObject(`SnackbarError`)

    errorSnackbar.vars.text = message
    console.error(message)
    errorSnackbar.show()
}
/**
 * Shows an info snackbar with the provided message.
 * Displays a snackbar component with the given info message.
*/
const showInfo = (message) => {
    let infoSnackbar = Component.getObject(`SnackbarInfo`)

    infoSnackbar.vars.text = message
    infoSnackbar.show()
}
