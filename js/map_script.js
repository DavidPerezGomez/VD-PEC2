import { MapHandler } from "./map_handler.js";

function updateDotValueVal() {
    dot_value_val.innerHTML = dot_value.value
}

function updateRelValueVal() {
    // https://stackoverflow.com/questions/2901102/how-to-format-a-number-with-commas-as-thousands-separators
    let number = rel_value.value
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    rel_value_val.innerHTML = number
}

function updateDistVal() {
    dist_val.innerHTML = dist.value
}

function updateEdgeDistVal() {
    edge_dist_val.innerHTML = edge_dist.value
}

function updateScaleVal() {
    scale_val.innerHTML = scale.value
}

dot_value.oninput = () => {
    updateDotValueVal();
    updateDots();
};

rel_value.oninput = () => {
    updateRelValueVal();
    updateDots();
};

dist.oninput = () => {
    updateDistVal();
    updateDots();
};

edge_dist.oninput = () => {
    updateEdgeDistVal();
    updateDots();
};

scale.oninput = () => {
    updateScaleVal();
    createMap();
};

relative.oninput = () => {
    if (relative.checked) {
        rel_div.style.display = "block";
        abs_dib.style.display = "none";
    } else {
        rel_div.style.display = "none";
        abs_dib.style.display = "block";
    }
    updateDots();
}

updateDotValueVal();
updateRelValueVal();
updateDistVal();
updateEdgeDistVal();
updateScaleVal();

const accidents = await d3.csv("./res/accident2021.csv", d3.autoType);
const accidentCount = accidents.reduce(
    (acc, item) => {
        let state = item["STATENAME"].toUpperCase();
        acc[state] = acc[state] || 0;
        acc[state] += 1;
        return acc;
    },
    {}
);

const census = await d3.csv("./res/NST-EST2022-ALLDATA.csv", d3.autoType);
const census2021 = {};
census.forEach((c) => {
    let state = c["NAME"].toUpperCase();
    let pop = c["POPESTIMATE2021"];
    census2021[state] = pop;
})

const usStates = await d3.json("./res/us-states.geo.json");

const options = {
    chartWidth: 850,
    chartHeight: 450,
    backgroundColor: "#e9e5cd",
    landColor: "#b96916",
    landStroke: "#311b06",
    markerColor: "#061b31",
    markerColorAlt: "#8c1211",
}

const mapHander = new MapHandler()
    .container(map_container)
    .geometry(usStates)
    .origin([-96.3438, 38.0092])
    .accidentData(accidentCount)
    .censusData(census2021)
    .options(options);

function getOptions() {
    return {
        scale: scale.value,
        dotDist: dist.value,
        edgeDist: edge_dist.value,
        relative: relative.checked,
        dotValue: dot_value.value,
        relValue: rel_value.value
    }
}

function updateDots() {
    mapHander
    .options(getOptions())
    .updateDots()
    .updateMap();
}

function createMap() {
    mapHander
        .options(getOptions())
        .createMap()
        .updateDots()
        .updateMap();
}

createMap();