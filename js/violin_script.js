import { ViolinHandler } from "./violin_handler.js";
import { categorize } from "./violin_utils.js";

function updateSeparator() {
    separator.value = separator_val.value
}

function updateSeparatorVal() {
    separator_val.value = separator.value
}

separator.oninput = updateSeparatorVal;
separator_val.onchange  = () => {
    let value = parseInt(separator_val.value);
    if (value < parseInt(separator.min) ||
        value > parseInt(separator.max)) {
        updateSeparatorVal();
        return;
    }
    updateSeparator();
};

function addSeparator() {
    if (d3.some(
        d3.selectAll("li"),
        li => li.value == separator.value
    )) {
        return;
    }

    let li = d3.selectAll("ul")
        .insert("li", function () {
            let elements = d3.select(this).selectAll("li");
            for (let li of elements) {
                if (li.value > separator.value)
                    return li;
            }
        })
        .attr("value", separator.value);

    li.append("code")
        .html(separator.value);

    li.append("button")
        .html("-")
        .on("click", removeSeparator);

    updateGraph();
};

function removeSeparator() {
    d3.select(this.parentNode)
        .remove();

    updateGraph();
};

d3.select("#add_separator_btn")
    .on("click", addSeparator);

d3.selectAll("li")
    .selectAll("button")
    .on("click", removeSeparator);

function updateBinsVal() {
    bins_val.innerHTML = bins.value
}

bins.oninput = () => {
    updateBinsVal();
    updateOptions({ nBins: bins.value });
    updateGraph();
};

updateSeparatorVal();
updateBinsVal();

const data = await d3.csv("res/insurance.csv", d3.autoType);

const options = {
    chartWidth: 800,
    chartHeight: 450,
    backgroundColor: "#e9e5cd",
    fillColor: "#b96916",
    stokeColor: "#311b06",
    markerColor: "#061b31",
    nBins: bins.value
};

const violinHandler = new ViolinHandler()
    .container(violin_container)
    .data(data)
    .options(options)
    .columnX("age")
    .columnY("charges")
    .xCategorizer(categorize)
    .createGraph();

function updateGraph() {
    violinHandler
        .updateCategories()
        .updateGraph();
}

function updateOptions(options) {
    violinHandler.options(options);
}

updateGraph();