const links = await d3.csv("res/alluvial.csv");

const options = {
    scale: 800,
    chartWidth: 850,
    chartHeight: 500,
    backgroundColor: "#EAF2FA",
    nodeStroke: "#FCF5E9",
    markerColor: "#E26F99",
    markerColorAlt: "#E26F99",
};

let svg = d3.create("svg")
    .attr("title", "Alluvial")
    .attr("width", options.chartWidth)
    .attr("height", options.chartHeight);

svg.append("rect")
    .attr("width", options.chartWidth)
    .attr("height", options.chartHeight)
    .attr("fill", options.backgroundColor);

svg.append("g")
    .attr("stroke", options.nodeStroke)
    .selectAll("rect");

alluvial_container.append(svg.node());