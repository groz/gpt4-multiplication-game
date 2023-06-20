function generateTable(minA, maxA, minB, maxB) {
    let tableArray = [];
    let tableMap = {};

    // generate list of [product, multiplier1, multiplier2] tuples
    for (let a = minA; a <= maxA; a++) {
        for (let b = minB; b <= maxB; b++) {
            tableArray.push([a * b, a, b]); 
        }
    }

    // sort by product
    tableArray.sort((a, b) => a[0] - b[0]);

    // map questions to their index in the flattened array
    for (let i = 0; i < tableArray.length; i++) {
        let [_, a, b] = tableArray[i];
        tableMap[`${a}x${b}`] = i;
    }

    return {
        tableArray, 
        tableMap,
        multipliers: (index) => tableArray[index].slice(1),
        index: (a, b) => tableMap[`${a}x${b}`],
        size: tableArray.length,
    };
}

// return a weighted random index in [start, end)
function getWeightedRandomIndex(weights, start, end) {
    let selectedIndex = -1;
    start = start || 0;
    end = end || weights.length;

    for (let i = start, totalWeight = 0.0; i < end; i++) {
        totalWeight += weights[i];
        if (Math.random() * totalWeight < weights[i]) {
            selectedIndex = i;
        }
    }

    return selectedIndex;
}

// return a weighted random question from the given range in the table
function getRandomQuestion(table, weights, startIndex, endIndex) {
    let index = getWeightedRandomIndex(weights, startIndex, endIndex);
    return table.multipliers(index);
}

function shuffle(xs) {
    for (let i = xs.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [xs[i], xs[j]] = [xs[j], xs[i]];
    }
}

function rescale(array) {
    let min = Math.min(...array);
    return array.map(num => num / min);
}
