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

const questionDiv = document.querySelector('.question')
const optionsDiv = document.querySelector('.options')

const questionsAttemptedDiv = document.querySelector('#questionsAttemptedBody')
const finishQuizBtn = document.querySelector('#finishQuiz')
const scoreDiv = document.querySelector('#scoreBody')


const updateSidebar = () => {
    sectionNameSpan.textContent = currentSection
    qnButtonsDiv.innerHTML = ''
    questions[currentSection].forEach((e, i) => {
        const elem = document.createElement('a')
        elem.classList.add('btn', 'm-1', 'text-white', 'qn-button')
        elem.textContent = i + 1
        elem.onclick = () => changeQuestion(i)
        if (currentQuestionsNumber == i) elem.classList.add('btn-primary')
        else {
            const answers = userAnswers.get(currentSection)
            if (answers[i] != null) elem.classList.add('btn-info')
            else elem.classList.add('btn-outline-primary')
        }
        qnButtonsDiv.append(elem)
    })
}

const changeQuestion = questionNumber => {
    if (questionNumber == undefined) questionNumber = currentQuestionsNumber
    currentQuestionsNumber = questionNumber
    const question = questions[currentSection][questionNumber]
    questionDiv.innerHTML = `<p class="text-dark question"> ${question.question} </p>`
    optionsDiv.innerHTML = ``

    let selectedOption = -1
    const answers = userAnswers.get(currentSection)
    if (answers[currentQuestionsNumber] != null)
        selectedOption = answers[currentQuestionsNumber]

    question.options.forEach((option) => {
        const addAttribute = (elem, attr) => input.substring(0, elem.length - 1) + ' ' + attr + input.substring(elem.length - 1)
        input = `<input type="radio" class="btn-check" name="options" id="${option}" value="${option}" autocomplete="off">`
        if (finishQuizBtn.style.visibility == 'hidden')
            input = addAttribute(input, 'disabled')
        if (option[0] == selectedOption)
            input = addAttribute(input, 'checked')
        label = `<label class="btn btn-outline-primary py-3 text-start" for="${option}" style="min-width: 300px;">${option}</label> <br>`

        optionsDiv.innerHTML += input
        optionsDiv.innerHTML += label
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

const displayAttempts = () => {
    // temp code to show answer
    temp = []
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
    sections.forEach(section => {
        let score = 0
        const inc = (1.0 / questions[section].length) * 100
        const answers = userAnswers.get(section)
        answers.forEach((a, i) => score += inc * (a == questions[section][i].answer)) // DAWMM
        score = score.toFixed(2)
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