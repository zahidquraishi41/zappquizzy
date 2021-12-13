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
