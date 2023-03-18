const messageHandlers = {
    LEVEL_CHANGED: handleLevelChanged,
    ANSWER_SELECTED: handleAnswerSelected,
    NEW_QUESTION: handleNewQuestion,
    TIMER_TICK: handleTimerTick,
};

function handleLevelChanged(state, payload) {
    const { level } = payload;
    const nextState = {
        ...state,
        currentLevel: level,
    };
    return handleNewQuestion(nextState);
}

function handleAnswerSelected(state, payload) {
    if (state.transitioning) {
        return state;
    }

    const { selectedAnswerIndex } = payload;

    let nextState = { ...state };
    let { attempts, correctAnswer, score, clickedAnswerIndices } = nextState;

    const isCorrect = state.allAnswers[selectedAnswerIndex] === correctAnswer;

    if (isCorrect) {
        score.correct++;
    } else {
        attempts++;
        if (attempts === MAX_INCORRECT_ANSWERS) {
            score.incorrect++;
        }
    }

    if (isCorrect || attempts === MAX_INCORRECT_ANSWERS) {
        nextState = handleNewQuestionTransition(nextState);
    } else {
        nextState.attempts = attempts;
    }

    nextState.clickedAnswerIndices = [...clickedAnswerIndices, selectedAnswerIndex];

    return nextState;
}

function handleNewQuestion(state) {
    if (state.timerID) {
        clearInterval(state.timerID);
    }

    const { num1, num2 } = generateQuestionByLevel(state.currentLevel);
    const correctAnswer = num1 * num2;
    const wrongAnswers = generateWrongAnswers(state.currentLevel, correctAnswer);

    const question = `${num1} x ${num2}`;
    const allAnswers = [correctAnswer, ...wrongAnswers];
    allAnswers.sort(() => Math.random() - 0.5);

    let timerID = null;

    if (state.currentLevel.timerDuration !== null) {
        timerID = setInterval(
            () => sendMessage(timerTickMessage()),
            TIMER_TICK_PERIOD
        );
    }

    return {
        ...state,
        question,
        correctAnswer,
        allAnswers,
        attempts: 0,
        clickedAnswerIndices: [],
        transitioning: false,
        timer: state.currentLevel.timerDuration,
        timerID: timerID,
    };
}

function handleNewQuestionTransition(state) {
    const nextState = {
        ...state,
        transitioning: true,
    };

    setTimeout(() => {
        sendMessage(newQuestionMessage());
    }, 500);

    return nextState;
}

function handleTimerTick(state) {
    if (!state.currentLevel.timerDuration || state.transitioning) {
        return state;
    }

    const nextState = { ...state };
    const remainingTime = Math.max(0, state.timer - TIMER_TICK_PERIOD);
    nextState.timer = remainingTime;

    if (remainingTime === 0) {
        return handleNewQuestionTransition(nextState);
    }

    if (
        remainingTime === state.currentLevel.timerDuration / 2 &&
        nextState.attempts === 0
    ) {
        const wrongAnswerIndex = state.allAnswers.findIndex(
            (answer) => answer !== state.correctAnswer
        );
        sendMessage(answerSelectedMessage(wrongAnswerIndex), 0);
    }

    return nextState;
}
