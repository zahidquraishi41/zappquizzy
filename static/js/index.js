const shuffleQuestionCB = document.querySelector('#shuffle-questions')
const enableTimerCB = document.querySelector('#enable-timer')
const timePerQuestionSelect = document.querySelector('#time-per-question')
const reselectorModalBody = document.querySelector('#reselectBody')
const reselectBtn = document.querySelector('#reselect')
let userSelections = undefined


shuffleQuestionCB.addEventListener('change', e => {
    toggleShuffleQuestions()
})
enableTimerCB.addEventListener('change', e => {
    toggleTimerEnabled()
    if (timerEnabled()) timePerQuestionSelect.disabled = false
    else timePerQuestionSelect.disabled = true
})
timePerQuestionSelect.addEventListener('change', e => {
    val = timePerQuestionSelect.selectedOptions[0].value
    timePerQuestion(val)
})

if (shuffleQuestions()) shuffleQuestionCB.checked = true
if (timerEnabled()) enableTimerCB.checked = true
else timePerQuestionSelect.disabled = true
timePerQuestionSelect.value = timePerQuestion()

let showReselectModal = () => {
    const createBtn = (name, href) => {
        let button = document.createElement('button')
        button.textContent = name
        button.classList.add('btn', 'btn-outline-primary', 'm-2')
        button.style.width = '100px'
        button.addEventListener('click', () => {
            $('#reselectModal').modal('hide')
            window.location.href = href
        })
        return button
    }
    if (reselectorModalBody.innerHTML.trim() == '') {
        if (userSelections.category)
            reselectorModalBody.append(createBtn('Category', '/categories'))
        if (userSelections.topic || userSelections.category)
            reselectorModalBody.append(createBtn('Topics', '/topics'))
        if (userSelections.chapter || userSelections.topic)
            reselectorModalBody.append(createBtn('Chapter', '/chapters'))
        if (userSelections.sections || userSelections.chapter)
            reselectorModalBody.append(createBtn('Sections', '/sections'))
        reApplyTheme()
    }
    $('#reselectModal').modal('show')
}

reselectBtn.addEventListener('click', async () => {
    if (userSelections == undefined) {
        const response = await fetch('/getmethod')
        userSelections = await response.json()
    }
    if (!userSelections.category) window.location.href = '/categories'
    else showReselectModal()
})

let data = { user_id: getUserId() };
fetch("/postmethod", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})
