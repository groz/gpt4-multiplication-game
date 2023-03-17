const levelConfig = {
    EASY: { min: 1, max: 5, emoji: "🐣" },
    MEDIUM: { min: 2, max: 6, emoji: "🐥" },
    HARD: { min: 3, max: 9, emoji: "💪" },
};

const MAX_INCORRECT_ANSWERS = 2;

const gameState = {
    levels: [levelConfig.EASY, levelConfig.MEDIUM, levelConfig.HARD],
    currentLevel: levelConfig.EASY,
    question: "",
    correctAnswer: null,
    allAnswers: [],
    score: { correct: 0, incorrect: 0 },
    attempts: 0,
    clickedAnswerIndices: [],
    transitioning: false,
};

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestionByLevel(level) {
    const num1 = generateRandomNumber(level.min, level.max);
    const num2 = generateRandomNumber(level.min, level.max);
    return { num1, num2 };
}

function generateWrongAnswers(level, correctAnswer) {
    const min = level.min * level.min;
    const max = level.max * level.max;
    let wrongAnswers = [];

    do {
        wrongAnswers = Array.from({ length: 2 }, () =>
            generateRandomNumber(min, max)
        );
    } while (
        wrongAnswers[0] === correctAnswer ||
        wrongAnswers[1] === correctAnswer ||
        wrongAnswers[0] === wrongAnswers[1]
    );

    return wrongAnswers;
}

function generateNewQuestion() {
    sendMessage(newQuestionMessage());
}

function render(state) {
    $('.question').text(state.question);

    state.levels.forEach((level, index) => {
        const $button = $('.levels button').eq(index);
        renderLevelButton($button, state, level);
    });

    state.allAnswers.forEach((answer, index) => {
        const $button = $('.options button').eq(index);
        renderAnswerButton($button, state, index);
    });

    $("#correct-score").text(state.score.correct);
    $("#incorrect-score").text(state.score.incorrect);
}

$(document).ready(function () {
    generateNewQuestion();
});

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

function createSendMessage(initialState, reducer, render) {
    let currentState = initialState;

    return function sendMessage(message) {
        currentState = reducer(currentState, message);
        setTimeout(() => render(currentState), 0);
    };
}

const sendMessage = createSendMessage(gameState, reducer, render);

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

const messageHandlers = {
    LEVEL_CHANGED: handleLevelChanged,
    ANSWER_SELECTED: handleAnswerSelected,
    NEW_QUESTION: handleNewQuestion,
    NEW_QUESTION_TRANSITION: handleNewQuestionTransition,
};

function reducer(state, message) {
    const handler = messageHandlers[message.type];

    if (handler) {
        return handler(state, message.payload);
    }

    return state;
}

function renderLevelButton($button, state, level) {
    $button.text(level.emoji);
    $button.off('click').click(() => {
        sendMessage(levelChangedMessage(level));
    });

    if (state.currentLevel === level) {
        $button.addClass('active-level');
    } else {
        $button.removeClass('active-level');
    }
}

function renderAnswerButton($button, state, index) {
    const answer = state.allAnswers[index];
    $button.text(answer);

    if (state.clickedAnswerIndices.includes(index)) {
        $button.prop('disabled', true);
        $button.removeClass('correct-answer incorrect-answer');
        const isAnswerCorrect = answer == state.correctAnswer;
        $button.addClass(isAnswerCorrect ? 'correct-answer' : 'incorrect-answer');
    } else {
        $button.prop('disabled', false);
        $button.removeClass('correct-answer incorrect-answer');
    }

    $button.off('click').click(() => {
        sendMessage(answerSelectedMessage(index));
    });
}
