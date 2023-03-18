$(document).ready(function () {
    generateNewQuestion();
});

function createSendMessage(state, reducer, render) {
    return (message) => {
        setTimeout(() => {
            state = reducer(state, message);
            render(state), 0;
        })
    };
}

const sendMessage = createSendMessage(initialState, reducer, render);
