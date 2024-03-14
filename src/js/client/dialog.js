const AlertHelper = async (message, title, dialogType) => {
    const showAlert = async() => {
        let dialog = document.body.querySelector(`#AlertDialog`)
        let newDialog = !dialog

        if (newDialog) {
            const props = { okMessage: `ALERT_OK` }
            const newInclude = Component.createComponentInclude(`./html/components/dialog.html`, `AlertDialog`, props, null)

            document.body.appendChild(newInclude)
            await Loader.loadIncludes()
            dialog = document.body.querySelector(`#AlertDialog`) 
        }

        const dialogObj = Component.getObject(`AlertDialog`)

        if (newDialog) {
            const props = { 
                dialogId: `AlertDialog`,
                clickMessage: `ALERT_BUTTON_OK` 
            }
            const vars = { 
                alertTitle: title, 
                message,
                dialogType
            }

            await SlottedComponent.loadSlotFromInclude(dialog, `AlertDialogSlot`, `./html/components/dialog-alert.html`,  `AlertDialogContent`, props, vars)
        } else {
            const alertDialogContent = Component.getObject(`AlertDialogContent`)

            alertDialogContent.vars.message = message
            alertDialogContent.vars.title = title
        }
        dialogObj.showModal()

    }
      
    return new Promise((resolve, reject) => {
        Queue.registerAsync(`AlertDialog`, `ALERT_OK`, async (message) => { 
            const dialogObj = Component.getObject(`AlertDialog`)
            const dialogContentObj = Component.getObject(`AlertDialogContent`)

            await dialogObj.destroy()
            await dialogContentObj.destroy()
            Queue.unregister(`AlertDialog`, `ALERT_OK`)
            resolve(message)
        })
        showAlert()
    })
}

const Alert = async (message, title) => { AlertHelper(message, title, `standard`) }
const Info = async (message, title) => { AlertHelper(message, title, `info`) }
const Warn = async (message, title) => { AlertHelper(message, title, `warn`) }
const Error = async (message, title) => { AlertHelper(message, title, `error`) }
const Success = async (message, title) => { AlertHelper(message, title, `success`) }

const Confirm = async (message, title) => {
    const showConfirm = async() => {
        let dialog = document.body.querySelector(`#ConfirmDialog`)
        let newDialog = !dialog

        if (newDialog) {
            const props = { 
                okMessage: `CONFIRM_OK`,
                cancelMessage: `CONFIRM_CANCEL`
            }
            const newInclude = Component.createComponentInclude(`./html/components/dialog.html`, `ConfirmDialog`, props, null)

            document.body.appendChild(newInclude)
            await Loader.loadIncludes()
            dialog = document.body.querySelector(`#ConfirmDialog`) 
        }

        const dialogObj = Component.getObject(`ConfirmDialog`)

        if (newDialog) {
            const props = { 
                dialogId: `ConfirmDialog`,
                clickMessage: `CONFIRM_BUTTON_OK`,
                cancelMessage: `CONFIRM_BUTTON_CANCEL` 
            }
            const vars = { 
                alertTitle: title, 
                message 
            }

            await SlottedComponent.loadSlotFromInclude(dialog, `ConfirmDialogSlot`, `./html/components/dialog-confirm.html`,  `ConfirmDialogContent`, props, vars)
        } else {
            const confirmDialogContent = Component.getObject(`ConfirmDialogContent`)

            confirmDialogContent.vars.message = message
            confirmDialogContent.vars.title = title
        }
        dialogObj.showModal()

    }
      
    return new Promise((resolve, reject) => {
        Queue.register(`ConfirmDialog`, `CONFIRM_OK`, (message) => { 
            Queue.unregister(`ConfirmDialog`, `CONFIRM_OK`)
            resolve(true)
        })
        Queue.register(`ConfirmDialog`, `CONFIRM_CANCEL`, (message) => { 
            Queue.unregister(`ConfirmDialog`, `CONFIRM_CANCEL`)
            resolve(false)
        })
        showConfirm()
    })
}

const Prompt = async (message, title, prompt, defaultValue) => {
    const showPrompt = async() => {
        let dialog = document.body.querySelector(`#PromptDialog`)
        let newDialog = !dialog

        if (newDialog) {
            const props = { 
                okMessage: `PROMPT_OK`,
                cancelMessage: `PROMPT_CANCEL`
            }
            const newInclude = Component.createComponentInclude(`./html/components/dialog.html`, `PromptDialog`, props, null)

            document.body.appendChild(newInclude)
            await Loader.loadIncludes()
            dialog = document.body.querySelector(`#PromptDialog`) 
        }

        const dialogObj = Component.getObject(`PromptDialog`)

        if (newDialog) {
            const props = { 
                dialogId: `PromptDialog`,
                clickMessage: `PROMPT_BUTTON_OK`,
                cancelMessage: `PROMPT_BUTTON_CANCEL` 
            }
            const vars = { 
                alertTitle: title, 
                message,
                prompt,
                defaultValue
            }

            await SlottedComponent.loadSlotFromInclude(dialog, `PromptDialogSlot`, `./html/components/dialog-prompt.html`,  `PromptDialogContent`, props, vars)
        } else {
            const promptDialogContent = Component.getObject(`PromptDialogContent`)

            promptDialogContent.vars.message = message
            promptDialogContent.vars.title = title
        }
        dialogObj.showModal()

    }
      
    return new Promise((resolve, reject) => {
        Queue.register(`PromptDialog`, `PROMPT_OK`, (message) => { 
            Queue.unregister(`PromptDialog`, `PROMPT_OK`)
            resolve(message)
        })
        Queue.register(`PromptDialog`, `PROMPT_CANCEL`, (message) => { 
            Queue.unregister(`PromptDialog`, `PROMPT_CANCEL`)
            resolve(false)
        })
        showPrompt()
    })
}

const CalendarDialog = async (
    selectedDate,
    pastDatesAreGray = true,
    yearRange = [ new Date().getFullYear(), new Date().getFullYear() + 5 ],
    year = new Date().getFullYear(),
    month = new Date().getMonth(),
    day = new Date().getDate(),
    monthNames = [ `January`, `February`, `March`, `April`, `May`, `June`, `July`, `August`, `September`, `October`, `November`, `December`]
) => {
    const showWorker = async() => {
        let dialog = document.body.querySelector(`#CalendarDialog`)
        let newDialog = !dialog

        if (newDialog) {
            const props = { 
                okMessage: `CALENDAR_OK`,
                cancelMessage: `CALENDAR_CANCEL`
            }
            const newInclude = Component.createComponentInclude(`./html/components/dialog.html`, `CalendarDialog`, props, null)

            document.body.appendChild(newInclude)
            await Loader.loadIncludes()
            dialog = document.body.querySelector(`#CalendarDialog`) 
        }

        const dialogObj = Component.getObject(`CalendarDialog`)

        if (newDialog) {
            const props = { 
                pastDatesAreGray: pastDatesAreGray,
                dialogId: `CalendarDialog`,
                clickMessage: `CALENDAR_BUTTON_OK`,
                cancelMessage: `CALENDAR_BUTTON_CANCEL` 
            }
            const vars = { 
                dialogtitle: `Select Date`,
                selectedDay: selectedDate.getDate(),
                selectedMonth: selectedDate.getMonth(),
                selectedYear: selectedDate.getFullYear(),
                year,
                month,
                monthName: monthNames[month],
                day,
                monthNames,
                yearRange
            }

            await SlottedComponent.loadSlotFromInclude(dialog, `CalendarDialogSlot`, `./html/components/dialog-calendar.html`,  `CalendarDialogContent`, props, vars)
        }

        const calendarDialogContent = Component.getObject(`CalendarDialogContent`)

        calendarDialogContent.vars.selectedDay = selectedDate.getDate()
        calendarDialogContent.vars.selectedMonth = selectedDate.getMonth()
        calendarDialogContent.vars.selectedYear = selectedDate.getFullYear()
        calendarDialogContent.Calendar.setSelectedCell()
        dialogObj.showModal()
    }
    
    return new Promise((resolve, reject) => {
        Queue.register(`CalendarDialog`, `CALENDAR_OK`, (message) => { 
            const calendarDialogContent = Component.getObject(`CalendarDialogContent`)

            Queue.unregister(`CalendarDialog`, `CALENDAR_OK`)
            resolve({
                day: calendarDialogContent.Calendar.vars.selectedDay,
                month: calendarDialogContent.Calendar.vars.selectedMonth + 1,
                year: calendarDialogContent.Calendar.vars.selectedYear
            })
        })
        Queue.register(`CalendarDialog`, `CALENDAR_CANCEL`, (message) => { 
            Queue.unregister(`CalendarDialog`, `CALENDAR_CANCEL`)
            resolve(false)
        })
        showWorker()
    })
}

const TimeDialog = async (time) => {
    const showWorker = async() => {
        let dialog = document.body.querySelector(`#TimeDialog`)
        let newDialog = !dialog

        if (newDialog) {
            const props = { 
                okMessage: `TIME_OK`,
                cancelMessage: `TIME_CANCEL`
            }
            const newInclude = Component.createComponentInclude(`./html/components/dialog.html`, `TimeDialog`, props, null)

            document.body.appendChild(newInclude)
            await Loader.loadIncludes()
            dialog = document.body.querySelector(`#TimeDialog`) 
        }

        const dialogObj = Component.getObject(`TimeDialog`)
        const roundToFive = (minutes) => {
            if (3 > minutes) { return 0 }
            if (8 > minutes) { return 5 }
            if (13 > minutes) { return 10 }
            if (18 > minutes) { return 15 }
            if (23 > minutes) { return 20 }
            if (28 > minutes) { return 25 }
            if (33 > minutes) { return 30 }
            if (38 > minutes) { return 35 }
            if (43 > minutes) { return 40 }
            if (48 > minutes) { return 45 }
            if (53 > minutes) { return 55 }
            return 0
        }

        if (newDialog) {
            const props = { 
                dialogId: `TimeDialog`,
                clickMessage: `TIME_BUTTON_OK`,
                cancelMessage: `TIME_BUTTON_CANCEL` 
            }
            const vars = { 
                dialogtitle: `Select Time`,
                hour: time.getHours() % 12,
                minute: roundToFive(time.getMinutes()),
                meridiem: (time.getHours() >= 12)? `PM` : `AM`
            }

            await SlottedComponent.loadSlotFromInclude(dialog, `TimeDialogSlot`, `./html/components/dialog-time.html`,  `TimeDialogContent`, props, vars)
        }

        const timeDialogContent = Component.getObject(`TimeDialogContent`)

        timeDialogContent.vars.hour = time.getHours() % 12
        timeDialogContent.vars.minute = roundToFive(time.getMinutes())
        timeDialogContent.vars.meridiem = (time.getHours() >= 12)? `PM` : `AM`
        timeDialogContent.Time.selectTime()
        dialogObj.showModal()
    }
    
    return new Promise((resolve, reject) => {
        Queue.register(`TimeDialog`, `TIME_OK`, (message) => { 
            const timeDialogContent = Component.getObject(`TimeDialogContent`)

            Queue.unregister(`TimeDialog`, `TIME_OK`)
            resolve({
                hour: timeDialogContent.Time.vars.hour,
                minute: timeDialogContent.Time.vars.minute,
                meridiem: timeDialogContent.Time.vars.meridiem
            })
        })
        Queue.register(`TimeDialog`, `TIME_CANCEL`, (message) => { 
            Queue.unregister(`TimeDialog`, `TIME_CANCEL`)
            resolve(false)
        })
        showWorker()
    })
}