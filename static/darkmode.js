const darkTexts = document.querySelector('.text-dark')
const lightTexts = document.querySelector('.text-light')

const darkBackground = document.querySelector('.bg-dark')
const lightBackground = document.querySelector('.bg-light')

function toggleDarkMode() {
    const body = document.querySelector('body')
    if (body.classList.contains('text-dark'))
        darkMode()
    else lightMode()
}

function darkMode() {
    const body = document.querySelector('body')
    const cls = body.classList
    cls.add('text-light', 'bg-dark')
    cls.remove('text-dark', 'bg-light')

    const selectableButtons = document.querySelectorAll('.btn')
    if (selectableButtons != null)
        selectableButtons.forEach(button => button.classList.add('text-light'))
    localStorage.setItem('use-dark-mode', 'true')
}

function lightMode() {
    const body = document.querySelector('body')
    const cls = body.classList
    cls.remove('text-light', 'bg-dark')
    cls.add('text-dark', 'bg-light')

    const selectableButtons = document.querySelectorAll('.btn')
    if (selectableButtons != null) {
        selectableButtons.forEach(button => button.classList.remove('text-light'))
    }

    localStorage.setItem('use-dark-mode', 'false')
}

if (localStorage.getItem('use-dark-mode') == 'true')
    darkMode()
