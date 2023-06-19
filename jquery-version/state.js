const levelConfig = {
    EASY: { difficulty: "EASY", min: 1, max: 5, emoji: "🐣", timerDuration: null, weight: 1 },
    MEDIUM: { difficulty: "MEDIUM", min: 2, max: 6, emoji: "🐥", timerDuration: 16000, weight: 2 },
    HARD: { difficulty: "HARD", min: 3, max: 9, emoji: "💡", timerDuration: 12000, weight: 3 },
    EXPERT: { difficulty: "EXPERT", min: 4, max: 9, emoji: "⚡", timerDuration: 7000, weight: 4 },
    MASTER: { difficulty: "MASTER", min: 2, max: 9, emoji: "🏆", timerDuration: 4000, weight: 5 },
};

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
