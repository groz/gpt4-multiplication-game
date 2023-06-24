const messageHandlers = {
    LEVEL_CHANGED: handleLevelChanged,
    ANSWER_SELECTED: handleAnswerSelected,
    NEW_QUESTION: handleNewQuestion,
    TIMER_TICK: handleTimerTick,
    NEW_GAME: handleNewGame,
    INIT_GAME: handleInitGame,
};

function handleLevelChanged(state, payload) {
    const { level } = payload;

    if (state.gameState.isGameOver) {
        return {
            ...state,
            currentLevel: level,
        };
    }

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
    if (state.gameState.isGameOver) {
        return state;
    }

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
        questionWeights[state.questionState.correctAnswerIndex] *= REDUCTION_MULTIPLIER;

        if (questionWeights[state.questionState.correctAnswerIndex] < 0.5) {
            console.log("rescaling");
            inplaceRescale(questionWeights);
        }
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
    count = Math.min(count, table.size - 2); // -2 to account for correct answer

    const candidates = [];
    let i = 1;
    while (candidates.length < count * 2 && i < 5 * count) {
        // 5 * count is an infinite loop guard
        let shift = (i % 2 === 0) ? i / 2 : -(Math.floor(i / 2) + 1);
        let idx = correctAnswerIndex + shift;

        if (0 <= idx && idx < table.size) {
            let [a, b] = table.multipliers(idx);
            let wrongAnswer = a * b;

            if (!candidates.includes(wrongAnswer) && wrongAnswer !== correctAnswer) {
                candidates.push(wrongAnswer);
            }
        }

        i++;
    }
    shuffle(candidates);

    const answers = [correctAnswer, ...candidates.slice(0, count - 1)];
    shuffle(answers);
    return answers;
}

function handleNewQuestion(state) {
    if (state.gameState.isGameOver) {
        return state;
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
            highlightCorrect: false,
        },
    };
}

function handleNewQuestionTransition(state) {
    if (state.gameState.isGameOver) {
        return state;
    }

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

function calculateRemainingTime(startTime, timerDuration) {
    const now = Date.now();
    const elapsed = now - startTime;
    return Math.max(0, timerDuration - elapsed);
}

function handleTimerTick(state) {
    if (state.gameState.isGameOver) {
        return state;
    }

    const nextState = { ...state };

    // Update game
    const gameRemainingTime = calculateRemainingTime(
        state.gameState.timerStart,
        state.gameState.timerDuration,
    );
    nextState.gameState.remainingTime = gameRemainingTime;
    nextState.gameState.isGameOver = gameRemainingTime <= 0;

    if (nextState.gameState.isGameOver) {
        return nextState;
    }

    nextState.gameState.timerText = formatTime(gameRemainingTime);

    // Update question
    if (!state.currentLevel.timerDuration || state.questionState.transitioning) {
        return nextState;
    }

    const remainingTime = calculateRemainingTime(
        state.questionState.questionTimerStart,
        state.currentLevel.timerDuration,
    );
    nextState.questionState.remainingTime = remainingTime;

    if (remainingTime <= 0) {
        nextState.questionState.highlightCorrect = true;
        return handleNewQuestionTransition(nextState);
    }

    return nextState;
}

function logProbabilities(table, questionWeights) {
    const probabilities = [];
    for (let i = 0; i < table.size; i++) {
        let [a, b] = table.multipliers(i);
        let question = `${a}x${b}`;
        let item = [questionWeights[i], question];
        probabilities.push(item);
    }

    probabilities.sort((a, b) => b[0] - a[0]);

    for (let i = 0; i < probabilities.length; i++) {
        let [weight, question] = probabilities[i];
        let formattedWeight = weight.toFixed(2);
        console.log(`${question}: ${formattedWeight}`);
    }
}

function handleNewGame(state) {
    console.log("new game");

    logProbabilities(ALL_QUESTIONS, state.questionWeights);

    if (state.gameState.timerID) {
        console.log("clearing timer interval: " + state.gameState.timerID);
        clearInterval(state.gameState.timerID);
    }

    let nextState = handleInitGame(state);
    nextState.gameState.isGameOver = false;
    return handleNewQuestion(nextState);
}

function handleInitGame(state) {
    let timerID = setInterval(
        () => sendMessage(timerTickMessage()),
        TIMER_TICK_PERIOD
    );

    let nextState = {
        ...state,
        levelScores: cleanLevelScores(),
        gameState: {
            ...state.gameState,
            timerStart: Date.now(),
            timerID: timerID,
            isGameOver: true,
        },
    }

    nextState.questionState.transitioning = false;
    return handleTimerTick(nextState);
}