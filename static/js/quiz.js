/*  questions: json
{
    '$section_name': [
        0: {
            'question': '$question'
            'options': '$options'
            'answer': '$answer'
            'explanation': '$explanation'
        },
        ...
    ],
    ...
}
*/

/*  quiz_history: json
{
    '$(date time)': {
        'date': '$date',
        'time': '$time',
        'average': '$average'
        'scores': [
            0: {
                'section': '$section',
                'attempted': '$attempted',
                'total': '$total'
            },
            ...
        ]
    },
    ...
}
 */

/* markedQuestions: Map
    {
        $section_name: [
            boolean, 
            ...
        ],
        ...
    }
 */

// Selectors
const sectionNameSpan = document.querySelector('.section-name')
const qnButtonsDiv = document.querySelector('.qn-buttons')

const questionPre = document.querySelector('.question')
const optionsDiv = document.querySelector('.options')
const explanationDiv = document.querySelector('.explanation')

const missingSectionsModal = new bootstrap.Modal(document.getElementById('missingSectionsModal'), {
    keyboard: false,
    backdrop: 'static'
})
const questionsAttemptedDiv = document.querySelector('#questionsAttemptedBody')
const finishQuizBtn = document.querySelector('#finishQuiz')
const scoreDiv = document.querySelector('#scoreBody')

const timerDiv = document.querySelector('#timer')
const tlTextSpan = document.querySelector('#tl-text')

const markForReviewBtn = document.querySelector('#markForReview')

// Config
let questions = document.querySelector('#questions').value
questions = JSON.parse(questions)
let missingSections = document.querySelector('#missing-sections').value
missingSections = JSON.parse(missingSections)

document.querySelector('#questions').remove()
document.querySelector('#missing-sections').remove()

const sections = Object.keys(questions)
if (shuffleQuestions())
    sections.forEach(section => questions[section].sort(() => Math.random() - 0.5))
let currentSection = null
let currentQuestionsNumber = 0
let totalQuestions = 0
sections.forEach(section => totalQuestions += questions[section].length)
let userAnswers = new Map()
let markedQuestions = new Map()
sections.forEach(section => {
    let arr = new Array(questions[section].length).fill(null)
    userAnswers.set(section, arr)
})
sections.forEach(section => {
    let arr = new Array(questions[section].length).fill(false)
    markedQuestions.set(section, arr)
})

const USE_TIMER = timerEnabled()
const TIME_PER_QUESTION = timePerQuestion() // in seconds
const PASSING_AVERAGE = 25
const TOTAL_TIME = TIME_PER_QUESTION * totalQuestions // in seconds
let timeLeft = TOTAL_TIME // in seconds


const updateSidebar = () => {
    sectionNameSpan.textContent = currentSection
    qnButtonsDiv.innerHTML = ''
    questions[currentSection].forEach((question_dict, i) => {
        const qnButton = document.createElement('a')
        qnButton.classList.add('btn', 'm-1', 'qn-button')
        qnButton.textContent = i + 1
        qnButton.onclick = () => changeQuestion(i, true)

        // coloring options if quiz is finished
        if (finishQuizBtn.style.visibility == 'hidden') {
            if (userAnswers.get(currentSection)[i] == question_dict.answer)
                qnButton.classList.add('btn-success')
            else qnButton.classList.add('btn-danger')
        } else {
            if (markedQuestions.get(currentSection)[i]) {
                qnButton.classList.add('btn-warning')
            }
            else {
                const answers = userAnswers.get(currentSection)
                if (answers[i] != null) qnButton.classList.add('btn-secondary')
                else qnButton.classList.add('btn-outline-primary')
            }
        }
        if (currentQuestionsNumber == i) qnButton.classList.add('border', 'border-white')
        qnButtonsDiv.append(qnButton)
    })
    const prevSection = document.querySelector('.fa-arrow-left')
    const nextSection = document.querySelector('.fa-arrow-right')
    prevSection.style.visibility = (sections.indexOf(currentSection) == 0) ? 'hidden': 'visible'
    nextSection.style.visibility = (sections.indexOf(currentSection) == sections.length - 1) ? 'hidden': 'visible'
}

const changeQuestion = (questionNumber, closeSidebar) => {
    if (questionNumber == undefined) questionNumber = currentQuestionsNumber
    currentQuestionsNumber = questionNumber
    const question = questions[currentSection][questionNumber]
    questionPre.textContent = `Q${currentQuestionsNumber + 1}. ` + question.question
    optionsDiv.innerHTML = ``

    let selectedOption = -1
    const answers = userAnswers.get(currentSection)
    if (answers[currentQuestionsNumber] != null)
        selectedOption = answers[currentQuestionsNumber]

    const addAttribute = (elem, attr) => elem.substring(0, elem.lastIndexOf('>')) + ` ${attr}` + elem.substring(elem.lastIndexOf('>'))
    question.options.forEach((option) => {
        input = `<input type="radio" class="btn-check" name="options" id="${option[0]}" value="${option}" autocomplete="off">`
        if (finishQuizBtn.style.visibility == 'hidden')
            input = addAttribute(input, 'disabled')
        if (option[0] == selectedOption)
            input = addAttribute(input, 'checked')

        const label = document.createElement('label')
        label.classList.add('btn', 'py-3', 'text-start', 'option')
        label.htmlFor = option[0]
        const pre = document.createElement('pre')
        pre.classList.add('option', 'tex2jax_process')
        pre.textContent = option
        label.append(pre)

        // coloring options if quiz is finished
        if (finishQuizBtn.style.visibility == 'hidden') {
            if (option[0] == selectedOption && userAnswers.get(currentSection)[currentQuestionsNumber] != question.answer)
                label.classList.add('btn-danger')
            else if (option[0] == question.answer)
                label.classList.add('btn-success')
            else label.classList.add('btn-outline-primary')
            explanationDiv.innerHTML = ''
            const explanationPre = document.createElement('pre')
            explanationPre.classList.add('mt-3', 'snmt', 'tex2jax_process')
            explanationPre.textContent = question.explanation
            explanationDiv.append(explanationPre)
        } else label.classList.add('btn-outline-primary')

        optionsDiv.innerHTML += input
        optionsDiv.append(label)
        optionsDiv.innerHTML += '<br>'
    })
    updateSidebar()
    if (markedQuestions.get(currentSection)[currentQuestionsNumber])
        markForReviewBtn.textContent = 'Remove From Review'
    else
        markForReviewBtn.textContent = 'Mark For Review'
    reApplyTheme()
    try {
        MathJax.typeset()
    } catch (ignore) { }

    if (closeSidebar && window.innerWidth <= 858) $('#sidebar, #content').addClass('active');
    const nextBtn = document.querySelector('#next-question')
    const prevBtn = document.querySelector('#prev-question')
    if (currentQuestionsNumber == 0) prevBtn.setAttribute('disabled', '')
    else prevBtn.removeAttribute('disabled')
    if (currentQuestionsNumber == questions[currentSection].length - 1) nextBtn.setAttribute('disabled', '')
    else nextBtn.removeAttribute('disabled')
}

const nextQuestion = () => {
    if (currentQuestionsNumber < questions[currentSection].length - 1)
        changeQuestion((currentQuestionsNumber + 1) % questions[currentSection].length)
}

const prevQuestion = () => {
    if (currentQuestionsNumber > 0)
        changeQuestion((currentQuestionsNumber - 1) % questions[currentSection].length)
}

const nextSection = () => {
    const currIndex = sections.indexOf(currentSection)
    if (currIndex == sections.length - 1) return
    const nextIndex = (currIndex + 1)
    currentSection = sections[nextIndex]
    changeQuestion(0)
}

const prevSection = () => {
    const currIndex = sections.indexOf(currentSection)
    if (currIndex == 0) return
    const prevIndex = (currIndex - 1)
    currentSection = sections[prevIndex]
    changeQuestion(0)
}

const updateScore = () => {
    const date = new Date()
    const ddmmyyyy = date.toDateString()
    const hhmmss = date.toLocaleTimeString()

    score_json = {}
    let average = 0
    let scores = []
    sections.forEach(section => {
        let attempted = 0
        const total = questions[section].length
        userAnswers.get(section).forEach(a => attempted += (a != null))

        let score = 0
        const inc = (1.0 / questions[section].length) * 100
        const answers = userAnswers.get(section)
        answers.forEach((a, i) => score += inc * (a == questions[section][i].answer)) // DAWMM
        average += score
        score = `${score.toFixed(2)}%`

        scores.push({
            'section': section,
            'attempted': attempted,
            'total': total,
            'score': score
        })
    })
    average = (average / (sections.length * 100)) * 100
    average = average.toFixed(2)

    score_json[`${ddmmyyyy} ${hhmmss}`] = {
        'average': average,
        'date': ddmmyyyy,
        'time': hhmmss,
        'scores': scores
    }
    userScores(score_json)
}

const zappReveal = () => {
    const temp = []
    sections.forEach(section => {
        ans = []
        questions[section].forEach(e => ans.push(e.answer))
        temp.push(ans)
    })
    console.log(temp)
}

const zapp100 = () => {
    sections.forEach(section => {
        const answers = userAnswers.get(section)
        questions[section].forEach((e, i) => answers[i] = e.answer)
    })
    answer = questions[currentSection][currentQuestionsNumber].answer
    optionsDiv.querySelector(`[for="${answer}"]`).click()
}

const displayAttempts = () => {
    let attemptsTable = ''
    if (isDarkMode())
        attemptsTable = `<table class="table table-dark table-striped"><tbody>`
    else attemptsTable = `<table class="table table-striped"><tbody>`

    sections.forEach(section => {
        let attempted = 0
        const total = questions[section].length
        const answers = userAnswers.get(section)
        answers.forEach(a => attempted += (a != null)) // DAWM
        attemptsTable += `
        <tr>
            <td colspan="3">${section}</td>
            <td>${attempted}/${total}</td>
        </tr>`
    })
    attemptsTable += `</tbody></table>`
    questionsAttemptedDiv.innerHTML = attemptsTable

    $("#questionsAttemptedModal").modal("show");
}

const resetAndGoHome = () => {
    location.assign('home')
}

const displayScoreModal = () => {
    finishQuizBtn.style.visibility = 'hidden'
    markForReviewBtn.style.visibility = 'hidden'
    updateScore()

    let scoreTable = ''
    if (isDarkMode())
        scoreTable = `<table class="table table-dark table-striped"><tbody>`
    else scoreTable = `<table class="table table-striped"><tbody>`

    sections.forEach(section => {
        let score = 0
        const inc = (1.0 / questions[section].length) * 100
        const answers = userAnswers.get(section)
        answers.forEach((a, i) => score += inc * (a == questions[section][i].answer)) // DAWMM
        score = score.toFixed(2)

        if (score < 25.0)
            scoreCls = 'text-danger'
        else if (score < 50.0)
            scoreCls = 'text-info'
        else
            scoreCls = 'text-success'

        scoreTable += `
        <tr>
            <td colspan="3">${section}</td>
            <td class="${scoreCls}">${score}%</td>
        </tr>`
    })

    const history = userScores()
    const key = Object.keys(history).at(-1)
    let average = Number(history[key]['average'])
    average = average.toFixed(2)
    if (average < 25.0)
        scoreCls = 'text-danger'
    else if (average < 50.0)
        scoreCls = 'text-info'
    else
        scoreCls = 'text-success'
    scoreTable += `
    <tr>
        <td colspan="3">Average Score</td>
        <td class="${scoreCls}">${average}%</td>
    </tr>`
    scoreTable += `</tbody></table>`
    scoreDiv.innerHTML = scoreTable

    $("#questionsAttemptedModal").modal("hide");
    changeQuestion()
    $("#scoreModal").modal("show");
}

const markForReview = () => {
    isMaked = markedQuestions.get(currentSection)[currentQuestionsNumber]
    markedQuestions.get(currentSection)[currentQuestionsNumber] = !isMaked
    if (markedQuestions.get(currentSection)[currentQuestionsNumber])
        markForReviewBtn.textContent = 'Remove From Review'
    else
        markForReviewBtn.textContent = 'Mark Fom Review'
    updateSidebar()
}

optionsDiv.addEventListener('click', e => {
    if (e.target.nodeName != 'INPUT') return
    const answers = userAnswers.get(currentSection)
    answers[currentQuestionsNumber] = e.target.value[0]
    updateSidebar()
})

const updateTimer = timerInterval => {
    if (timeLeft == 0) {
        displayScoreModal()
        clearInterval(timerInterval)
    } else if (finishQuizBtn.style.visibility == 'hidden') {
        clearInterval(timerInterval)
        return
    }

    let temp = timeLeft
    let hours = Math.floor(temp / 3600)
    temp -= (hours * 3600)

    let minutes = Math.floor(temp / 60)
    temp -= (minutes * 60)

    let seconds = temp

    let hoursText = (hours ? hours + 'H ' : '')
    let minutesText = (hours ? minutes + 'M ' : (minutes ? minutes + 'M ' : ''))
    let secondsText = seconds + 'S'
    tlTextSpan.textContent = hoursText + minutesText + secondsText
    timeLeft -= 1
}

function loadContent() {
    currentSection = sections[0]
    changeQuestion(0)
    if (USE_TIMER) {
        updateTimer()
        timerDiv.classList.remove('invisible')
        timeLeft += 1
        let timerInterval = setInterval(() => {
            updateTimer(timerInterval)
        }, 1000);
    }
}


if (missingSections.length) {
    if (sections.length != 0)
        document.getElementById('missingSectionsModal')
            .querySelector('.btn-primary')
            .classList.remove('invisible')
    missingSectionsModal.show()
} else loadContent()

window.addEventListener("beforeunload", function (e) {
    if (finishQuizBtn.style.visibility == 'hidden') return
    var confirmationMessage = 'Changes you made may not be saved.';
    (e || window.event).returnValue = confirmationMessage;
    return confirmationMessage;
});
