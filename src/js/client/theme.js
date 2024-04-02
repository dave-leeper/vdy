class Theme {
    /**
     * The current theme name, defaulting to 'light'.
     */
    static currentTheme = `light`
    /**
     * Template literal placeholder for current theme name.
     */
    static themeTag = `{theme}`
    /**
     * Sets the current theme.
     * 
     * @param {string} theme - The name of the new theme.
     * 
     * Broadcasts BEFORE_THEME_CHANGED and AFTER_THEME_CHANGED events with 
     * the old and new theme names. Updates the data-theme attribute on the 
     * document element and the Theme.currentTheme property.
     */
    static set theme(theme) {
        const oldTheme = Theme.currentTheme

        Queue.broadcast(Messages.BEFORE_THEME_CHANGED, { oldTheme, theme })
        document.documentElement.setAttribute('data-theme', theme)
        Theme.currentTheme = theme
        Queue.broadcast(Messages.AFTER_THEME_CHANGED, { oldTheme, theme })
    }
    /**
     * Gets the current theme name from the data-theme attribute on the document element.
     */
    static get theme() { return document.documentElement.getAttribute('data-theme') }
    /**
     * Replaces all instances of the Theme.themeTag placeholder 
     * with the current theme name stored in Theme.currentTheme.
     * This allows theme-dependent values to be dynamically 
     * inserted into strings.
     */
    static updateTheme(str) { return str.replaceAll(Theme.themeTag, Theme.currentTheme) }
    /**
     * Gets the value of the given CSS property from the root element.
     * 
     * @param {string} name - The name of the CSS property to get.
     * @returns {string} The value of the CSS property on the root element.
     */
    static getPropertyValue(name) {
        const root = document.querySelector(`:root`)
        var style = getComputedStyle(root);
        const propertyValue = style.getPropertyValue(name)

        return propertyValue
    }
}