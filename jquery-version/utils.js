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
