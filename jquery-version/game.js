$(document).ready(function () {
    generateNewQuestion();
});

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
