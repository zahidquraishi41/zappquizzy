const sections = Object.keys(questions)
let currentSection = sections[0]
let currentQuestionsNumber = 0
let userAnswers = new Map()

const sectionNameSpan = document.querySelector('.section-name')
const qnButtonsDiv = document.querySelector('.qn-buttons')

const questionDiv = document.querySelector('.question')
const optionsDiv = document.querySelector('.options')
const quizForm = document.querySelector('#quiz')

const questionsAttemptedDiv = document.querySelector('#questionsAttemptedBody')

const updateSidebar = () => {
    sectionNameSpan.textContent = currentSection
    qnButtonsDiv.innerHTML = ''
    questions[currentSection].forEach((e, i) => {
        const elem = document.createElement('a')
        elem.classList.add('btn', 'm-1', 'text-white', 'qn-button')
        elem.textContent = i + 1
        elem.onclick = () => changeQuestion(i)

        if (currentQuestionsNumber == i) elem.classList.add('btn-primary')
        else if (userAnswers.has(currentSection)) {
            const answers = userAnswers.get(currentSection)
            if (answers[i] != null) elem.classList.add('btn-info')
            else elem.classList.add('btn-outline-primary')
        } else elem.classList.add('btn-outline-primary')

        qnButtonsDiv.append(elem)
    })
}

const changeQuestion = questionNumber => {
    currentQuestionsNumber = questionNumber
    const question = questions[currentSection][questionNumber]
    questionDiv.innerHTML = `<p class="text-dark question"> ${question.question} </p>`
    optionsDiv.innerHTML = ``

    let selectedOption = -1
    if (userAnswers.has(currentSection)) {
        const answers = userAnswers.get(currentSection)
        if (answers[currentQuestionsNumber] != null)
            selectedOption = answers[currentQuestionsNumber]
    }

    question.options.forEach((option, i) => {
        if (option[0] == selectedOption)
            input = `<input type="radio" class="btn-check" name="options" id="${option}" value="${option}" autocomplete="off" checked>`
        else
            input = `<input type="radio" class="btn-check" name="options" id="${option}" value="${option}" autocomplete="off">`
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
    questionsAttemptedDiv.innerHTML = ''
    sections.forEach(section => {
        let attempted = 0
        const total = questions[section].length
        if (userAnswers.has(section)) {
            const answers = userAnswers.get(section)
            answers.forEach(a => attempted += (a != null)) // DAWM
        }
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


optionsDiv.addEventListener('click', e => {
    if (e.target.nodeName != 'LABEL') return
    if (!userAnswers.has(currentSection)) {
        let arr = new Array(questions[currentSection].length).fill(null)
        userAnswers.set(currentSection, arr)
    }
    const answers = userAnswers.get(currentSection)
    answers[currentQuestionsNumber] = e.target.textContent[0]
})

changeQuestion(0)