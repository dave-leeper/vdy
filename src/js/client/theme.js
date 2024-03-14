class Theme {
    static currentTheme = `light`
    static themeTag = `{theme}`
    static set theme(theme) { 
        const oldTheme = Theme.currentTheme

        Queue.broadcast(Messages.BEFORE_THEME_CHANGED, { oldTheme, theme } )
        document.documentElement.setAttribute('data-theme', theme) 
        Theme.currentTheme = theme
        Queue.broadcast(Messages.AFTER_THEME_CHANGED, { oldTheme, theme } )
    }
    static get theme() { return document.documentElement.getAttribute('data-theme') }
    static updateTheme(str) { return str.replaceAll(Theme.themeTag, Theme.currentTheme) }
    static getPropertyValue(name) {
        const root = document.querySelector(`:root`)
        var style = getComputedStyle(root);
        const propertyValue = style.getPropertyValue(name)

        return propertyValue
    }
}