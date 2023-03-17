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
