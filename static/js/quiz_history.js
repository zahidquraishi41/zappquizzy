const caretdownI = `<i class="fas fa-caret-down"></i>`
const caretupI = `<i class="fas fa-caret-up"></i>`
const noHistoryH1 = document.querySelector('#no-history')
const rowDiv = document.querySelector('.row')
const totalAttemptsP = document.querySelector('#total-attempts')
const successfulAttemptsP = document.querySelector('#successful-attempts')
const avgScoreSpan = document.querySelector('#avg-score')
const history = userScores()
const quizKeys = Object.keys(history)

const ANIM_DURATION = 800

const format_selector = key => 'id-' + key.replace(/[\W_]+/g, "x");

function countToAnim(tag, value, duration) {
    let i = 0
    let interval = setInterval(() => {
        tag.textContent = i
        if (i == value) clearInterval(interval)
        i += 1
    }, duration / value);
}

function createCollapsible(id, name) {
    const elem = document.createElement('div')
    elem.classList.add('rounded', 'text-start', 'd-flex', 'text-light', 'collapsible')
    elem.classList.add('p-3', 'mb-3')
    elem.setAttribute('data-bs-toggle', 'collapse')
    elem.setAttribute('role', 'button')
    elem.setAttribute('aria-expanded', 'false')
    elem.setAttribute('aria-constrols', 'false')
    elem.setAttribute('href', `#${id}`)
    elem.innerHTML += `<span>${name}</span>`
    elem.innerHTML += `<i class="fas fa-caret-down ms-auto pe-3"></i>`
    return elem
}

// Creating overview cards
if (quizKeys.length > 0)
    noHistoryH1.style.display = 'none'
let successfulAttempts = 0
let averagesSum = 0
quizKeys.forEach(quizId => {
    const average = Number(history[quizId]['average'])
    if (average >= 25.0) successfulAttempts += 1
    averagesSum += average
})
let avgScore = 0
if (quizKeys.length != 0) {
    avgScore = Number(averagesSum / quizKeys.length)
    avgScore = Math.trunc(avgScore)
}
if (quizKeys.length >= 3) countToAnim(totalAttemptsP, quizKeys.length, ANIM_DURATION)
else totalAttemptsP.textContent = quizKeys.length
if (successfulAttempts >= 3) countToAnim(successfulAttemptsP, successfulAttempts, ANIM_DURATION)
else successfulAttemptsP.textContent = successfulAttempts
if (avgScore >= 3) countToAnim(avgScoreSpan, avgScore, ANIM_DURATION)
else avgScoreSpan.textContent = avgScore

// Creating collapsible history rows
quizKeys.forEach(quizId => {
    const row_id = format_selector(quizId)

    const main_collapser = createCollapsible(row_id, quizId)
    if (Number(history[quizId]['average']) > 25.0)
        main_collapser.classList.add('bg-success')
    else main_collapser.classList.add('bg-danger')
    rowDiv.append(main_collapser)

    const hiddenContent = document.createElement('div')
    hiddenContent.classList.add('collapse')
    hiddenContent.id = row_id
    rowDiv.append(hiddenContent)
    const table = document.createElement('table')
    table.classList.add('table', 'table-striped', 'snmtable')

    const tbody = document.createElement('tbody')
    tbody.classList.add('text-start')

    history[quizId]['scores'].forEach(section => {
        tbody.innerHTML += `<tr>
        <td width="70%">${section['section']}</td>
        <td>${section['score']}</td>
        </tr>`
    })
    tbody.innerHTML += `<tr>
    <td width="70%">Average</td>
    <td>${history[quizId]['average']}%</td>
    </tr>`

    table.append(tbody)
    hiddenContent.append(table)
})

// changing caret direction on click
document.querySelectorAll('.collapsible').forEach(elem => {
    elem.addEventListener('click', () => {
        iTag = elem.querySelector('i')
        iTag.classList.toggle('fa-caret-down')
        iTag.classList.toggle('fa-caret-up')
    })
})

reApplyTheme()
