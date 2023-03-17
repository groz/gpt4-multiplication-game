$(document).ready(function () {
    generateNewQuestion();
});

function createSendMessage(initialState, reducer, render) {
    let currentState = initialState;

    return function sendMessage(message) {
        currentState = reducer(currentState, message);
        setTimeout(() => render(currentState), 0);
    };
}

const sendMessage = createSendMessage(initialState, reducer, render);
