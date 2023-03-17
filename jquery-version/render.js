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

    $("#correct-score").text(state.score.correct);
    $("#incorrect-score").text(state.score.incorrect);
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
