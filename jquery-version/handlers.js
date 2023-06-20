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
        questionState: {
            ...state.questionState,
            highlightCorrect: true,
        },
    };
    return handleNewQuestionTransition(nextState);
}

function handleAnswerSelected(state, payload) {
    if (state.questionState.transitioning) {
        return state;
    }

    const { selectedAnswerIndex } = payload;

    let nextState = { ...state };
    let { questionWeights, levelScores } = nextState;
    let { attempts, correctAnswer } = nextState.questionState;

    const isCorrect = state.questionState.allAnswers[selectedAnswerIndex] === correctAnswer;

    if (isCorrect) {
        levelScores[state.currentLevel.difficulty].correct++;
        questionWeights[state.questionState.correctAnswerIndex] *= state.reductionMultiplier;
    } else {
        attempts++;
        if (attempts === MAX_INCORRECT_ANSWERS) {
            levelScores[state.currentLevel.difficulty].incorrect++;
        }
    }

    if (attempts === MAX_INCORRECT_ANSWERS) {
        nextState.questionState.highlightCorrect = true;
    }

    if (isCorrect || attempts === MAX_INCORRECT_ANSWERS) {
        nextState = handleNewQuestionTransition(nextState);
    } else {
        nextState.questionState.attempts = attempts;
    }

    nextState.questionState.clickedAnswerIndices = [
        ...nextState.questionState.clickedAnswerIndices,
        selectedAnswerIndex,
    ];

    return nextState;
}

function generateAnswers(table, count, correctAnswer, correctAnswerIndex) {
    const answers = [correctAnswer];
    count = Math.min(count, table.size - 2); // -2 to account for correct answer

    let i = 1;
    while (answers.length < count && i < 5 * count) {
        // 5 * count is an infinite loop guard
        let shift = (i % 2 === 0) ? i / 2 : -(Math.floor(i / 2) + 1);
        let idx = correctAnswerIndex + shift;

        if (0 <= idx && idx < table.size) {
            let [a, b] = table.multipliers(idx);
            let ans = a * b;

            if (!answers.includes(ans)) {
                answers.push(ans);
            }
        }

        i++;
    }

    shuffle(answers);
    return answers;
}

function handleNewQuestion(state) {
    if (state.questionState.timerID) {
        clearInterval(state.questionState.timerID);
    }

    const [num1, num2] = getRandomQuestion(
        ALL_QUESTIONS,
        state.questionWeights,
        state.currentLevel.min,
        state.currentLevel.max,
    );

    const correctAnswer = num1 * num2;
    const correctAnswerIndex = ALL_QUESTIONS.index(num1, num2);
    const allAnswers = generateAnswers(ALL_QUESTIONS, 3, correctAnswer, correctAnswerIndex);
    const question = `${num1} x ${num2}`;

    let timerID = null;

    if (state.currentLevel.timerDuration !== null) {
        timerID = setInterval(
            () => sendMessage(timerTickMessage()),
            TIMER_TICK_PERIOD
        );
    }

    return {
        ...state,
        questionState: {
            ...state.questionState,
            questionText: question,
            questionTimerStart: Date.now(),
            correctAnswer: correctAnswer,
            correctAnswerIndex: correctAnswerIndex,
            allAnswers: allAnswers,
            attempts: 0,
            clickedAnswerIndices: [],
            transitioning: false,
            remainingTime: state.currentLevel.timerDuration,
            timerID: timerID,
            highlightCorrect: false,
        },
    };
}

function handleNewQuestionTransition(state) {
    const nextState = {
        ...state,
        questionState: {
            ...state.questionState,
            transitioning: true,
        },
    };

    setTimeout(
        () => sendMessage(newQuestionMessage()),
        500
    );

    return nextState;
}

function handleTimerTick(state) {
    if (!state.currentLevel.timerDuration || state.questionState.transitioning) {
        return state;
    }

    const nextState = { ...state };
    const now = Date.now();
    const elapsed = now - state.questionState.questionTimerStart;
    const remainingTime = Math.max(0, state.currentLevel.timerDuration - elapsed);
    nextState.questionState.remainingTime = remainingTime;

    if (remainingTime <= 0) {
        nextState.questionState.highlightCorrect = true;
        return handleNewQuestionTransition(nextState);
    }

    // Remove one of the wrong answers after half the time has elapsed
    if (
        remainingTime <= (state.currentLevel.timerDuration / 2) &&
        nextState.questionState.attempts === 0
    ) {
        const wrongAnswerIndex = state.questionState.allAnswers.findIndex(
            (answer) => answer !== state.questionState.correctAnswer
        );

        sendMessage(answerSelectedMessage(wrongAnswerIndex));
    }

    return nextState;
}
