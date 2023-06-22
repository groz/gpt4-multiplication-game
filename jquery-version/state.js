const ALL_QUESTIONS = generateTable(1, 9, 1, 9);
const MAX_INCORRECT_ANSWERS = 2;
const TIMER_TICK_PERIOD = 50;
// how much to reduce the weight of a question after a correct answer
const REDUCTION_MULTIPLIER = 0.7;

const levelConfig = {
    EASY: generateLevel("EASY", 0, 43, "🐣", null, 1),
    MEDIUM: generateLevel("MEDIUM", 23, 61, "🐥", 16000, 2),
    HARD: generateLevel("HARD", 23, 81, "💪", 12000, 3),
    EXPERT: generateLevel("EXPERT", 43, 81, "⚡", 7000, 4),
    MASTER: generateLevel("MASTER", 23, 81, "🏆", 4000, 5),
};

function generateLevel(difficulty, min, max, emoji, timerDuration, weight) {
    return {
        difficulty,
        min: min,
        max: max,
        emoji,
        timerDuration,
        weight,
    }
}

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

    cleanState: false,
    debug: false,
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
    console.log("saving state");
    const storedState = { 
        questionWeights: state.questionWeights,
        currentLevel: state.currentLevel,
     };
    const serializedState = JSON.stringify(storedState);
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
            if (state.debug) {
                console.log("message: ", message);
                console.log("state: ", state);
            }

            state = reducer(state, message);

            if (state.debug) {
                console.log("new state: ", state);
            }

            // store state unless explicitly told not to
            if (!message.config || message.config.storeState !== false) {
                saveState(state);
            }
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
