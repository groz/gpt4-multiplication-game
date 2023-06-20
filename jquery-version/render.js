function render(state) {
    $('.question').text(state.questionState.questionText);

    state.levels.forEach((level, index) => {
        const $button = $('.levels button').eq(index);
        renderLevelButton($button, state, level);
    });

    state.questionState.allAnswers.forEach((answer, index) => {
        const $button = $('.options button').eq(index);
        renderAnswerButton($button, state, index);
    });

    renderScoreboard(state);
    renderTimerProgress(state);
    renderGameTimer(state);
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
    $button.removeClass('correct-answer incorrect-answer correct-unselected-answer');
    const answer = state.questionState.allAnswers[index];
    const isAnswerCorrect = answer == state.questionState.correctAnswer;

    $button.text(answer);

    if (state.questionState.clickedAnswerIndices.includes(index)) {
        $button.prop('disabled', true);
        $button.addClass(isAnswerCorrect ? 'correct-answer' : 'incorrect-answer');
    } else {
        $button.prop('disabled', false);
    }

    if (state.questionState.highlightCorrect && isAnswerCorrect) {
        $button.addClass('correct-unselected-answer');
    }

    $button.off('click').click(() => {
        sendMessage(answerSelectedMessage(index));
    });
}

function renderTimerProgress(state) {
    const $timerContainer = $(".timer-container");
    const $timerProgress = $(".timer-progress");
    const $timerMarker = $(".timer-marker");

    if (state.currentLevel.timerDuration) {
        $timerContainer.show();
        $timerProgress.show();
        $timerMarker.show();
        $timerContainer.removeClass("timer-container-hidden");
    } else {
        $timerProgress.hide();
        $timerMarker.hide();
        $timerContainer.addClass("timer-container-hidden");
    }

    const timerPercentage = state.questionState.remainingTime
        ? (state.questionState.remainingTime / state.currentLevel.timerDuration) * 100
        : 0;

    if (!state.questionState.transitioning) {
        $timerProgress.width(`${timerPercentage}%`);
    }
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

function renderGameTimer(state) {
    const $gameTimer = $(".game-timer");
    const $gameStartButton = $(".game-start");
    const $gameRestartButton = $(".game-restart");

    $gameStartButton.off('click').click(() => {
        sendMessage(newGameMessage());
    });

    $gameRestartButton.off('click').click(() => {
        sendMessage(newGameMessage(true));
    });

    if (state.gameState.timerText) {
        $gameTimer.show();
    } else {
        $gameTimer.hide();
    }

    $gameTimer.text(state.gameState.timerText);

    if (state.gameState.isGameOver) {
        $gameTimer.hide();
        $gameRestartButton.hide();
        $gameStartButton.show();        
    } else {
        $gameTimer.show();
        $gameRestartButton.show();
        $gameStartButton.hide();
    }
}
