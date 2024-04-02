/**
 * Vars is a class that provides utility methods for getting and setting CSS custom properties on the document.
 * 
 * It contains two static methods:
 * 
 * - setVar: Sets a CSS custom property on the document root or a provided pseudo-class selector.
 * 
 * - getVar: Gets the value of a CSS custom property from the document root or a provided pseudo-class selector.
 */
class Vars {
    /**
     * Sets a CSS custom property on the document root or optionally on a provided pseudo-class selector.
     * @param {string} name - The name of the CSS custom property
     * @param {string} value - The value to set for the custom property 
     * @param {string} [optionalPseudoClass] - An optional pseudo-class selector to set the property on instead of the root
     */
    static setVar(name, value, optionalPseudoClass) {
        const psuedoClassName = optionalPseudoClass ? optionalPseudoClass : `:root`
        const psuedoClass = document.querySelector(psuedoClassName)

        psuedoClass.style.setProperty(name, value)
    }
    /**
     * Gets the value of a CSS custom property from the document root or optionally from a provided pseudo-class selector.
     * @param {string} name - The name of the CSS custom property
     * @param {string} [optionalPseudoClass] - An optional pseudo-class selector to get the value from instead of the root
     * @returns {string} The value of the custom property
     */
    static getVar(name, optionalPseudoClass) {
        const psuedoClassName = optionalPseudoClass ? optionalPseudoClass : `:root`
        const psuedoClass = document.querySelector(psuedoClassName)
        const style = getComputedStyle(psuedoClass)

        return style.getPropertyValue(name)
    }
}
