function shuffleQuestions(val) {
    /* if val is passed then sets shuffle-questions to val;
    otherwise returns value stored in localStorage. Default is false.*/
    if (val == undefined || val == null)
        return (localStorage.getItem('shuffle-questions') == 'true')
    localStorage.setItem('shuffle-questions', val)
}

function toggleShuffleQuestions() {
    shuffleQuestions(!shuffleQuestions())
}

function timerEnabled(val) {
    /* if val is passed then sets timerEnabled to val; 
    otherwise returns value stored in localStorage. Default is false.*/
    if (val == undefined || val == null)
        return (localStorage.getItem('enable-timer') == 'true')
    localStorage.setItem('enable-timer', val)
}

function toggleTimerEnabled() {
    timerEnabled(!timerEnabled())
}

function timePerQuestion(val) {
    /* if val is passed then sets val as new time; 
    otherwise returns value stored in localStorage. Default is 60.*/
    if (localStorage.getItem('time-per-question') == null)
        localStorage.setItem('time-per-question', '60')
    if (val == undefined || val == null)
        return Number(localStorage.getItem('time-per-question'))
    localStorage.setItem('time-per-question', val)
}

function userScores(val) {
    /* if val is passed then appends val on current json; 
    otherwise returns value stored in localStorage. Default is empty json.*/
    let scores = JSON.parse(localStorage.getItem('quiz_history'))
    if (scores == null) scores = {}
    if (val == null || val == undefined)
        return scores
    const key = Object.keys(val)
    const elem = val[key]
    scores[key] = elem
    localStorage.setItem('quiz_history', JSON.stringify(scores))
}

function getUserId() {
    let userId = localStorage.getItem('user-id')
    if (userId) return userId
    userId = generateUniqueId()
    localStorage.setItem('user-id', userId)
    return userId
}

function generateUniqueId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-='
    const chars_len = chars.length
    let id = ''
    for (let i=0; i<8; i++) {
        let index = Math.trunc((Math.random() * (chars_len - 1)))
        id += chars[index]
    }
    const time = Date.now()
    return time + id
}
