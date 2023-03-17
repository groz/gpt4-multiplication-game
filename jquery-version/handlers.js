const messageHandlers = {
    LEVEL_CHANGED: handleLevelChanged,
    ANSWER_SELECTED: handleAnswerSelected,
    NEW_QUESTION: handleNewQuestion,
    NEW_QUESTION_TRANSITION: handleNewQuestionTransition,
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
    const { num1, num2 } = generateQuestionByLevel(state.currentLevel);
    const correctAnswer = num1 * num2;
    const wrongAnswers = generateWrongAnswers(state.currentLevel, correctAnswer);

    const question = `${num1} x ${num2}`;
    const allAnswers = [correctAnswer, ...wrongAnswers];
    allAnswers.sort(() => Math.random() - 0.5);

    return {
        ...state,
        question,
        correctAnswer,
        allAnswers,
        attempts: 0,
        clickedAnswerIndices: [],
        transitioning: false,
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
