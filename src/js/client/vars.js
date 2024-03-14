class Vars {
    static setVar(name, value, optionalPseudoClass) {
        const psuedoClassName = optionalPseudoClass? optionalPseudoClass : `:root`
        const psuedoClass = document.querySelector(psuedoClassName)

        psuedoClass.style.setProperty(name, value)
    }
    static getVar(name, optionalPseudoClass) {
        const psuedoClassName = optionalPseudoClass? optionalPseudoClass : `:root`
        const psuedoClass = document.querySelector(psuedoClassName)
        const style = getComputedStyle(psuedoClass)

        return style.getPropertyValue(name)
    }
}
