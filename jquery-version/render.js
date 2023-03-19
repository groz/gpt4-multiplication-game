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

    renderScoreboard(state);
    renderTimerProgress(state);
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

function renderTimerProgress(state) {
    const $timerContainer = $(".timer-container");
    const $timerProgress = $(".timer-progress");

    if (state.currentLevel.timerDuration) {
        $timerContainer.show();
        $timerProgress.show();
        $timerProgress.width("0%");
    } else {
        $timerProgress.hide();
    }

    const timerPercentage = state.timer
        ? (state.timer / state.currentLevel.timerDuration) * 100
        : 0;
    $timerProgress.width(`${timerPercentage}%`);
}

function calculateTotalScores(levelScores, scoreType) {
    return Object.values(levelScores).reduce(
        (sum, levelScore) => sum + levelScore[scoreType],
        0
    );
}

function renderScoreboard(state) {
    const totalCorrect = calculateTotalScores(state.levelScores, 'correct');
    const totalIncorrect = calculateTotalScores(state.levelScores, 'incorrect');

    $("#correct-score").text(totalCorrect);
    $("#incorrect-score").text(totalIncorrect);
}
