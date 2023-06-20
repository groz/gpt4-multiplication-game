$(document).ready(function () {
    sendMessage(newGameMessage());
    $("#game-container").focus();

    window.addEventListener('keydown', function(event) {
        if(!event.ctrlKey) {
            switch (event.key) {
                case 'ArrowLeft':
                    sendMessage(answerSelectedMessage(0));
                    break;
                case 'ArrowDown':
                    sendMessage(answerSelectedMessage(1));
                    break;
                case 'ArrowRight':
                    sendMessage(answerSelectedMessage(2));
                    break;
            }
        }
    });
});
