function levelChangedMessage(level) {
    return {
        type: 'LEVEL_CHANGED',
        payload: { level },
    };
}

function answerSelectedMessage(selectedAnswerIndex) {
    return {
        type: 'ANSWER_SELECTED',
        payload: { selectedAnswerIndex },
    };
}

function newQuestionMessage() {
    return {
        type: 'NEW_QUESTION',
    };
}

function newQuestionTransitionMessage() {
    return {
        type: 'NEW_QUESTION_TRANSITION',
    };
}

function timerTickMessage() {
    return {
        type: "TIMER_TICK",
        config: {
            storeState: false,
        }
    };
}

function newGameMessage() {
    return {
        type: "NEW_GAME",
    };
}


function initGameMessage() {
    return {
        type: "INIT_GAME",
    };
}
