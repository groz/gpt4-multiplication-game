const levelConfig = {
    EASY: { key: "EASY", min: 1, max: 5, emoji: "🐣", timerDuration: null },
    MEDIUM: { key: "MEDIUM", min: 2, max: 6, emoji: "🐥", timerDuration: 20000 },
    HARD: { key: "HARD", min: 3, max: 9, emoji: "💪", timerDuration: 10000 },
};

const MAX_INCORRECT_ANSWERS = 2;
const TIMER_TICK_PERIOD = 50;

const initialState = {
    levels: [levelConfig.EASY, levelConfig.MEDIUM, levelConfig.HARD],
    currentLevel: levelConfig.EASY,
    question: "",
    correctAnswer: null,
    allAnswers: [],
    levelScores: {
        EASY: { correct: 0, incorrect: 0 },
        MEDIUM: { correct: 0, incorrect: 0 },
        HARD: { correct: 0, incorrect: 0 },
    },
    attempts: 0,
    clickedAnswerIndices: [],
    transitioning: false,
    timer: null,
    timerID: null,
};

function reducer(state, message) {
    const handler = messageHandlers[message.type];

    if (handler) {
        state = handler(state, message.payload);
    }

    return state;
}
