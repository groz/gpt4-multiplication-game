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

    if (state.currentLevel.difficulty === level.difficulty) {
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

function renderScoreboard(state) {
    const correctScore = Object.keys(state.levelScores).reduce((sum, difficulty) => {
        const levelScore = state.levelScores[difficulty];
        const levelWeight = levelConfig[difficulty].weight;
        return sum + (levelScore.correct * levelWeight);
    }, 0);

    const incorrectScore = Object.keys(state.levelScores).reduce((sum, difficulty) => {
        const levelScore = state.levelScores[difficulty];
        return sum + levelScore.incorrect;
    }, 0);

    $("#correct-score").text(correctScore);
    $("#incorrect-score").text(incorrectScore);
}
