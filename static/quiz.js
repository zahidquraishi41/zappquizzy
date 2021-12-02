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

const sections = Object.keys(questions)
let currentSection = sections[0]
let currentQuestionsNumber = 0
let userAnswers = new Map()
sections.forEach(section => {
    let arr = new Array(questions[section].length).fill(null)
    userAnswers.set(section, arr)
})

const sectionNameSpan = document.querySelector('.section-name')
const qnButtonsDiv = document.querySelector('.qn-buttons')

const questionPre = document.querySelector('.question')
const optionsDiv = document.querySelector('.options')
const explanationDiv = document.querySelector('.explanation')

const questionsAttemptedDiv = document.querySelector('#questionsAttemptedBody')
const finishQuizBtn = document.querySelector('#finishQuiz')
const scoreDiv = document.querySelector('#scoreBody')


const updateSidebar = () => {
    sectionNameSpan.textContent = currentSection
    qnButtonsDiv.innerHTML = ''
    questions[currentSection].forEach((question_dict, i) => {
        const qnButton = document.createElement('a')
        qnButton.classList.add('btn', 'm-1', 'text-white', 'qn-button')
        qnButton.textContent = i + 1
        qnButton.onclick = () => changeQuestion(i)

        // coloring options if quiz is finished
        if (finishQuizBtn.style.visibility == 'hidden') {
            if (userAnswers.get(currentSection)[i] == question_dict.answer)
                qnButton.classList.add('btn-success')
            else qnButton.classList.add('btn-danger')
        } else {
            if (currentQuestionsNumber == i) qnButton.classList.add('btn-primary')
            else {
                const answers = userAnswers.get(currentSection)
                if (answers[i] != null) qnButton.classList.add('btn-info')
                else qnButton.classList.add('btn-outline-primary')
            }
        }
        qnButtonsDiv.append(qnButton)
    })
}

const changeQuestion = questionNumber => {
    if (questionNumber == undefined) questionNumber = currentQuestionsNumber
    currentQuestionsNumber = questionNumber
    const question = questions[currentSection][questionNumber]
    questionPre.textContent = question.question
    optionsDiv.innerHTML = ``

    let selectedOption = -1
    const answers = userAnswers.get(currentSection)
    if (answers[currentQuestionsNumber] != null)
        selectedOption = answers[currentQuestionsNumber]

    question.options.forEach((option) => {
        const addAttribute = (elem, attr) => elem.substring(0, elem.indexOf('>')) + ` ${attr}` + elem.substring(elem.indexOf('>'))
        input = `<input type="radio" class="btn-check" name="options" id="${option}" value="${option}" autocomplete="off">`
        if (finishQuizBtn.style.visibility == 'hidden')
            input = addAttribute(input, 'disabled')
        if (option[0] == selectedOption)
            input = addAttribute(input, 'checked')

        const label = document.createElement('label')
        label.classList.add('btn', 'py-3', 'text-start', 'option')
        label.htmlFor = option
        const pre = document.createElement('pre')
        pre.textContent = option
        pre.classList.add('option')
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
            explanationPre.classList.add('mt-3')
            explanationPre.textContent = question.explanation
            explanationDiv.append(explanationPre)
        } else label.classList.add('btn-outline-primary')

        optionsDiv.innerHTML += input
        optionsDiv.append(label)
        optionsDiv.innerHTML += '<br>'
    })
    updateSidebar()
}

const nextQuestion = () => {
    if (currentQuestionsNumber < questions[currentSection].length - 1)
        changeQuestion((currentQuestionsNumber + 1) % questions[currentSection].length)
}

const prevQuestion = () => {
    if (currentQuestionsNumber > 1)
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
    const [month, day, year] = [date.getMonth(), date.getDate(), date.getFullYear()]
    const [hour, minutes, seconds] = [date.getHours(), date.getMinutes(), date.getSeconds()]
    const ddmmyyyy = `${day}-${month}-${year}`
    const hhmmss = `${hour}:${minutes}:${seconds}`

    let quiz_hist = localStorage.getItem('quiz_hist')
    if (!quiz_hist) quiz_hist = {}
    else quiz_hist = JSON.parse(quiz_hist)

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

    quiz_hist[`${ddmmyyyy} ${hhmmss}`] = {
        'average': average,
        'date': ddmmyyyy,
        'time': hhmmss,
        'scores': scores
    }
    scores_json = JSON.stringify(quiz_hist)
    localStorage.setItem(`${ddmmyyyy} ${hhmmss}`, scores_json)
}

const displayAttempts = () => {
    // temp code to show answer
    const temp = []
    sections.forEach(section => {
        ans = []
        questions[section].forEach(e => ans.push(e.answer))
        temp.push(ans)
    })
    console.log(temp)
    // end of temp code

    questionsAttemptedDiv.innerHTML = ''
    sections.forEach(section => {
        let attempted = 0
        const total = questions[section].length
        const answers = userAnswers.get(section)
        answers.forEach(a => attempted += (a != null)) // DAWM
        questionsAttemptedDiv.innerHTML += `
        <div class="row mb-2">
            <div class="col-md-6">
                <span>${section}</span>
            </div>
            <div class="col-md-6 text-right">
                <span>${attempted}/${total}</span>
            </div>
        </div>`
    })
    $("#questionsAttemptedModal").modal("show");
}

const resetAndGoHome = () => {
    changeQuestion(currentQuestionsNumber)
    location.assign('home')
}

const displayScoreModal = () => {
    finishQuizBtn.style.visibility = 'hidden'
    scoreDiv.innerHTML = ''
    updateScore()
    sections.forEach(section => {
        let score = 0
        const inc = (1.0 / questions[section].length) * 100
        const answers = userAnswers.get(section)
        answers.forEach((a, i) => score += inc * (a == questions[section][i].answer)) // DAWMM
        score = score.toFixed(2)
        let scoreSpan = ''
        if (score < 25.0)
            scoreSpan = `<span class='text-danger'>${score}%</span>`
        else if (score < 50.0)
            scoreSpan = `<span class='text-info'>${score}%</span>`
        else
            scoreSpan = `<span class='text-success'>${score}%</span>`

        scoreDiv.innerHTML += `
        <div class="row mb-2">
            <div class="col-md-6">
                <span>${section}</span>
            </div>
            <div class="col-md-6 text-right">
                ${scoreSpan}
            </div>
        </div>`
    })
    $("#questionsAttemptedModal").modal("hide");
    $("#scoreModal").modal("show");
}

optionsDiv.addEventListener('click', e => {
    if (e.target.nodeName != 'LABEL') return
    const answers = userAnswers.get(currentSection)
    answers[currentQuestionsNumber] = e.target.textContent[0]
})

changeQuestion(0)