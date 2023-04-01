$(document).ready(function () {
    generateNewQuestion();
});

function createSendMessage(state, reducer, render) {
    return (message) => {
        setTimeout(() => {
            state = reducer(state, message);
            saveState(state);
            render(state), 0;
        })
    };
}

const sendMessage = createSendMessage(
    loadState(),
    reducer,
    render
);
