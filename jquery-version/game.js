const levelConfig = {
    EASY: { min: 1, max: 5, emoji: "🐣" },
    MEDIUM: { min: 2, max: 6, emoji: "🐥" },
    HARD: { min: 3, max: 9, emoji: "💪" },
};

const MAX_INCORRECT_ANSWERS = 2;
let currentLevel = levelConfig.EASY;
let question = "";
let correctAnswer = null;
let allAnswers = [];
let score = { correct: 0, incorrect: 0 };
let attempts = 0;

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
    attempts = 0;

    const { num1, num2 } = generateQuestionByLevel(currentLevel);
    correctAnswer = num1 * num2;
    const wrongAnswers = generateWrongAnswers(currentLevel, correctAnswer);

    question = `${num1} x ${num2}`;
    allAnswers = [correctAnswer, ...wrongAnswers];
    allAnswers.sort(() => Math.random() - 0.5);

    $('.question').text(question);
    $('.options').empty();

    allAnswers.forEach((answer, index) => {
        const $button = $('<button>')
            .text(answer)
            .click(() => {
                if ($button.prop('disabled')) {
                    return;
                }
                $button.prop('disabled', true);
                $button.removeClass('correct-answer incorrect-answer');
                const isAnswerCorrect = checkAnswer(answer);
                $button.addClass(isAnswerCorrect ? 'correct-answer' : 'incorrect-answer');
            });

        $('.options').append($button);
    });

}

function updateScore() {
    $("#correct-score").text(score.correct);
    $("#incorrect-score").text(score.incorrect);
}

function checkAnswer(selectedAnswer) {
    const isCorrect = selectedAnswer === correctAnswer;

    if (isCorrect) {
        score.correct++;
        updateScore();
    } else {
        attempts++;

        if (attempts === MAX_INCORRECT_ANSWERS) {
            score.incorrect++;
            updateScore();
        }
    }

    if (isCorrect || attempts === MAX_INCORRECT_ANSWERS) {
        setTimeout(() => {
            generateNewQuestion();
        }, 500);
    }

    return isCorrect;
}

function renderLevelButtons() {
    Object.keys(levelConfig).forEach((levelKey) => {
        const level = levelConfig[levelKey];
        const $button = $('<button>')
            .addClass('level-button')
            .text(level.emoji)
            .click(() => {
                currentLevel = level;
                $('.level-button').removeClass('active-level');
                $button.addClass('active-level');
                generateNewQuestion();
            });

        if (currentLevel === level) {
            $button.addClass('active-level');
        }

        $('.levels').append($button);
    });

}

$(document).ready(function () {
    // Initialize the game
    renderLevelButtons();
    generateNewQuestion();
});
