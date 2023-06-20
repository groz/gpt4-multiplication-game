function isEmpty(x) {
    return x === undefined ||
        x === null ||
        x === '' ||
        x == {} ||
        x == [];
}

function isObject(x) {
    return typeof x === 'object' && x !== null;
}

function mergeOverrideEmpty(dst, src) {
    Object.keys(src).forEach((key) => {
        if (isEmpty(dst[key])) {
            dst[key] = src[key];
        } else if (isObject(src[key]) && isObject(dst[key])) {
            mergeOverrideEmpty(dst[key], src[key]);
        }
    });
}

function formatTime(timeInMilliseconds) {
    let seconds = Math.floor(timeInMilliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    let formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    let formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

    return formattedMinutes + ":" + formattedSeconds;
}
