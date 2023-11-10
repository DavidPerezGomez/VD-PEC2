function categorizeAge(d) {
    let separators = Array.from(d3.selectAll("li"))
        .map(li => li.value);
    if (!separators.length) return "All";

    for (let i = 0; i < separators.length; i++) {
        if (d < separators[i]) {
            if (i == 0) {
                return `<${separators[i]}`;
            }

            if (separators[i] == separators[i - 1] + 1) {
                return `${separators[i - 1]}`;
            }

            return `${separators[i - 1]}-${separators[i] - 1}`;
        }
    }
    return `≥${separators[separators.length - 1]}`;
}

// https://stackoverflow.com/questions/48719873/how-to-get-median-and-quartiles-percentiles-of-an-array-in-javascript-or-php
// sort array ascending
const asc = arr => arr.sort((a, b) => a - b);

const sum = arr => arr.reduce((a, b) => a + b, 0);

const mean = arr => sum(arr) / arr.length;

// sample standard deviation
const std = (arr) => {
    const mu = mean(arr);
    const diffArr = arr.map(a => (a - mu) ** 2);
    return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

const quantile = (arr, q) => {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};

const q25 = arr => quantile(arr, .25);

const q50 = arr => quantile(arr, .50);

const q75 = arr => quantile(arr, .75);

const median = arr => q50(arr);

export {
    categorizeAge,
    asc,
    sum,
    mean,
    std,
    quantile,
    q25,
    q50,
    q75,
    median
};