function categorize(d) {
    let separators = Array.from(d3.selectAll("li"))
                        .map(li => li.value);
    if (!separators.length) return "All";

    for (let i = 0; i < separators.length; i++) {
        if (d < separators[i]) {
            if (i == 0) {
                return `<${separators[i]}`;
            }

            if (separators[i] == separators[i-1] + 1) {
                return `${separators[i-1]}`;
            }

            return `${separators[i-1]}-${separators[i] - 1}`;
        }
    }
    return `≥${separators[separators.length-1]}`;
}

export { categorize };