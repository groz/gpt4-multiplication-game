let ALL_QUESTIONS = generateTable(1, 9, 1, 9);

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
    questionState: {
        questionText: "",
        questionTimerStart: null,
        correctAnswer: null,
        correctAnswerIndex: null,
        allAnswers: [],
        attempts: 0,
        clickedAnswerIndices: [],
        transitioning: false,
        remainingTime: null,
        highlightCorrect: false,
    },
    currentLevel: levelConfig.EASY,
    levelScores: cleanLevelScores(),
    gameState: {
        timerStart: null,
        timerDuration: 5 * 60 * 1000,
        // timerDuration: 2 * 1000, // 2 seconds
        remainingTime: null,
        timerText: "",
        
        // has to be true in initial state to start a new game
        // TODO: debug why this is necessary
        isGameOver: true,
    },

    // weights, one for each question. reduced for each correct answer.
    questionWeights: Array(ALL_QUESTIONS.size).fill(1),
    reductionMultiplier: 0.9,

    cleanState: false,
};

function cleanLevelScores() {
    let result = {};
    Object.keys(levelConfig).forEach(key => {
        result[key] = { correct: 0, incorrect: 0 };
    });
    return result;
}

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
    if (initialState.cleanState) {
        localStorage.clear();
        return initialState;
    }

    let storedState = {};
    const serializedState = localStorage.getItem('gameState');

    if (serializedState && serializedState !== "undefined") {
        storedState = JSON.parse(serializedState);
    }

    return { ...initialState, ...storedState };
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
