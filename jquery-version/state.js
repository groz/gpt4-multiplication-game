let ALL_QUESTIONS = generateTable(1, 2, 1, 3);

const levelConfig = {
    EASY: generateLevel("EASY", 1, 5, "🐣", null, 1),
    MEDIUM: generateLevel("MEDIUM", 2, 6, "🐥", 16000, 2),
    HARD: generateLevel("HARD", 3, 9, "💪", 12000, 3),
    EXPERT: generateLevel("EXPERT", 4, 9, "⚡", 7000, 4),
    MASTER: generateLevel("MASTER", 2, 9, "🏆", 4000, 5),
};

function generateLevel(difficulty, min, max, emoji, timerDuration, weight) {
    return {
        difficulty,
        min: ALL_QUESTIONS.index(min, min),
        max: ALL_QUESTIONS.index(max, max),
        emoji,
        timerDuration,
        weight,
    }
}

const MAX_INCORRECT_ANSWERS = 2;
const TIMER_TICK_PERIOD = 30;

const initialState = {
    levels: [
        levelConfig.EASY,
        levelConfig.MEDIUM,
        levelConfig.HARD,
        levelConfig.EXPERT,
        levelConfig.MASTER
    ],
    currentLevel: levelConfig.EASY,
    question: "",
    correctAnswer: null,
    correctAnswerIndex: null,
    allAnswers: [],
    levelScores: {
        EASY: { correct: 0, incorrect: 0 },
        MEDIUM: { correct: 0, incorrect: 0 },
        HARD: { correct: 0, incorrect: 0 },
        EXPERT: { correct: 0, incorrect: 0 },
        MASTER: { correct: 0, incorrect: 0 },
    },
    attempts: 0,
    clickedAnswerIndices: [],
    transitioning: false,
    timer: null,
    timerID: null,
    highlightCorrect: false,

    // weights, one for each question. reduced for each correct answer.
    questionWeights: Array(ALL_QUESTIONS.size).fill(1),
    reductionMultiplier: 0.8,
};

function reducer(state, message) {
    const handler = messageHandlers[message.type];

    if (handler) {
        state = handler(state, message.payload);
    }

    return state;
}

function saveState(state) {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('gameState', serializedState);
}

function loadState() {
    let storedState = {};
    const serializedState = localStorage.getItem('gameState');

    if (serializedState && serializedState !== "undefined") {
        storedState = JSON.parse(serializedState);
    }

    return {...initialState, ...storedState};
}

function createSendMessage(state, reducer, render) {
    function messageSender(message) {
        function messageHandler() {
            state = reducer(state, message);
            saveState(state);
            render(state);
        }

        setTimeout(messageHandler, 0);
    }

    return messageSender;
}

const sendMessage = createSendMessage(
    loadState(),
    reducer,
    render
);
