/* USAGE
add snmt to apply darkmode to text
add snmb to apply darkmode to background
add snm to apply darkmode to both
*/
const DARK_MODE_KEY = 'use-dark-mode'
const isDarkMode = () => (localStorage.getItem(DARK_MODE_KEY) == 'true')

function toggleDarkMode() {
    const body = document.querySelector('body')
    if (body.classList.contains('text-dark'))
        darkMode()
    else lightMode()
}

function reApplyTheme() {
    if (isDarkMode()) darkMode()
    else lightMode()
}

function darkMode() {
    const body = document.querySelector('body')
    const cls = body.classList
    cls.add('text-light', 'bg-dark')
    cls.remove('text-dark', 'bg-light')

    const selectableButtons = document.querySelectorAll('.btn')
    selectableButtons.forEach(button => button.classList.add('text-light'))

    const snms = document.querySelectorAll('.snm')
    snms.forEach(snm => {
        snm.classList.add('text-light')
        snm.classList.add('bg-dark')
    })

    const snmts = document.querySelectorAll('.snmt')
    snmts.forEach(snm => {
        snm.classList.add('text-light')
    })

    const snmbs = document.querySelectorAll('.snmb')
    snmbs.forEach(snm => {
        snm.classList.add('bg-dark')
    })

    const snmbtns = document.querySelectorAll('.snmbtn')
    snmbtns.forEach(snmbtn => {
        snmbtn.classList.remove('text-light')
        snmbtn.classList.remove('btn-outline-dark')
        snmbtn.classList.add('btn-outline-light')
    })

    const faMoon = document.querySelector('.fa-moon')
    if (faMoon) {
        faMoon.classList.remove('fa-moon')
        faMoon.classList.add('fa-sun')
    }

    const snmtables = document.querySelectorAll('.snmtable')
    snmtables.forEach(snmtable => {
        snmtable.classList.add('table-dark')
    })

    localStorage.setItem(DARK_MODE_KEY, 'true')
}

function lightMode() {
    const body = document.querySelector('body')
    const cls = body.classList
    cls.remove('text-light', 'bg-dark')
    cls.add('text-dark', 'bg-light')

    const selectableButtons = document.querySelectorAll('.btn')
    selectableButtons.forEach(button => button.classList.remove('text-light'))

    const snms = document.querySelectorAll('.snm')
    snms.forEach(snm => {
        snm.classList.remove('text-light')
        snm.classList.remove('bg-dark')
    })

    const snmts = document.querySelectorAll('.snmt')
    snmts.forEach(snm => {
        snm.classList.remove('text-light')
    })

    const snmbs = document.querySelectorAll('.snmb')
    snmbs.forEach(snm => {
        snm.classList.remove('bg-dark')
    })

    const snmbtns = document.querySelectorAll('.snmbtn')
    snmbtns.forEach(snmbtn => {
        snmbtn.classList.remove('btn-outline-light')
        snmbtn.classList.add('btn-outline-dark')
    })

    const faSun = document.querySelector('.fa-sun')
    if (faSun) {
        faSun.classList.remove('fa-sun')
        faSun.classList.add('fa-moon')
    }

    const snmtables = document.querySelectorAll('.snmtable')
    snmtables.forEach(snmtable => {
        snmtable.classList.remove('table-dark')
    })

    localStorage.setItem(DARK_MODE_KEY, 'false')
}

if (isDarkMode()) darkMode()
document.addEventListener("readystatechange", event => {
    if (event.target.readyState == 'complete')
        document.querySelector('body').style.transition = 'all 0.3s'
});
