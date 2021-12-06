/* USAGE
add snmt to apply darkmode to text
add snmb to apply darkmode to background
add snm to apply darkmode to both
*/

function toggleDarkMode() {
    const body = document.querySelector('body')
    if (body.classList.contains('text-dark'))
        darkMode()
    else lightMode()
}

function reApplyTheme() {
    if (localStorage.getItem('use-dark-mode') == 'true')
        darkMode()
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

    localStorage.setItem('use-dark-mode', 'true')
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

    localStorage.setItem('use-dark-mode', 'false')
}

if (localStorage.getItem('use-dark-mode') == 'true')
    darkMode()
