const levelConfig = {
    EASY: { min: 1, max: 5, emoji: "🐣" },
    MEDIUM: { min: 2, max: 6, emoji: "🐥" },
    HARD: { min: 3, max: 9, emoji: "💪" },
};

const MAX_INCORRECT_ANSWERS = 2;

const initialState = {
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

function reducer(state, message) {
    const handler = messageHandlers[message.type];

    if (handler) {
        return handler(state, message.payload);
    }

    return state;
}
