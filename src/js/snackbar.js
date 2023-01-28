const showError = (message) => {
    let errorSnackbar = Component.getObject(`SnackbarError`)
            
    errorSnackbar.vars.text = message
    errorSnackbar.show()
}
const showInfo = (message) => {
    let infoSnackbar = Component.getObject(`SnackbarInfo`)
            
    infoSnackbar.vars.text = message
    infoSnackbar.show()
}
