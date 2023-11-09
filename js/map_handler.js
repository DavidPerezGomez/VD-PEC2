import { makeDots } from "./map_utils.js"

class MapHandler {

    constructor() {
        this._options = {
            chartWidth: 850,
            chartHeight: 500,
            backgroundColor: "#EAF2FA",
            landColor: "#09A573",
            landStroke: "#FCF5E9",
            markerColor: "#E26F99",
            markerColorAlt: "#E26F99",
            scale: 800,
            dotDist: 0.07,
            edgeDist: 0.15,
            relative: false,
            dotValue: 10,
            relValue: 100000
        };
        this._container;
        this._geometry;
        this._accidentData;
        this._censusData;
        this._origin = [-96.3438, 39.0092];
        this._projection;
        this._svg;
    }

    options(options) {
        Object.getOwnPropertyNames(this._options)
            .forEach(p => p in options ? this._options[p] = options[p] : null);
        return this;
    }

    container(container) {
        this._container = container;
        return this;
    }

    geometry(geometry) {
        this._geometry = geometry;
        return this;
    }

    accidentData(accidentData) {
        this._accidentData = accidentData;
        return this;
    }

    censusData(censusData) {
        this._censusData = censusData;
        return this;
    }

    origin(origin) {
        this._origin = origin;
        return this;
    }

    createMap() {
        this._projection = d3.geoMercator()
            .scale([this._options.scale])
            .center(this._origin)
            .translate([this._options.chartWidth / 2, this._options.chartHeight / 2]);

        let pathGenerator = d3.geoPath(this._projection);

        if (this._svg) {
            d3.select("svg").remove();
        }

        this._svg = d3.create("svg")
            .attr("title", "Map")
            .attr("width", this._options.chartWidth)
            .attr("height", this._options.chartHeight)

        this._svg.append("rect")
            .attr("width", this._options.chartWidth)
            .attr("height", this._options.chartHeight)
            .attr("fill", this._options.backgroundColor);

        this._svg.append("g")
            .attr("id", "map")
            .selectAll(null)
            .data(this._geometry.features)
            .join("path")
            .attr("d", pathGenerator)
            .attr("fill", this._options.landColor)
            .attr("stroke", this._options.landStroke)
            .attr("stroke_width", 0.5);

        return this;
    }

    calculateDots() {
        var dots = [];
        this._geometry.features.forEach((feature) => {
            let state = feature.properties.name.toUpperCase();
            if (this._accidentData[state]) {
                let nDots = this._accidentData[state] / this._options.dotValue;
                if (this._options.relative) {
                    nDots = this._accidentData[state] * this._options.relValue / this._censusData[state];
                }
                let polygons;
                if (feature.geometry.type == "MultiPolygon") {
                    polygons = [];
                    for (let polygon of feature.geometry.coordinates) {
                        polygons.push(polygon[0])
                    }
                } else {
                    polygons = feature.geometry.coordinates;
                }
                let distance = this._options.dotDist;
                let edgeDistance = this._options.edgeDist;
                dots.push(makeDots(polygons, nDots, { distance, edgeDistance }))
            }
        });

        return dots;
    }

    updateDots() {
        this._svg.select("#dots").remove();

        let dotGroups = this.calculateDots();

        let dotsGroup = this._svg.append("g")
            .attr("id", "dots");

        for (let dots of dotGroups) {
            dotsGroup.append("g")
                .selectAll(null)
                .data(dots)
                .join("circle")
                .attr("fill", dots.complete ? this._options.markerColor : this._options.markerColorAlt)
                .attr("class", !dots.complete ? "alt" : "")
                .attr("r", 0.002 * this._options.scale)
                .attr("cx", d => this._projection(d)[0])
                .attr("cy", d => this._projection(d)[1]);

        }

        return this;
    }

    updateMap() {
        this._container.append(this._svg.node());

        return this;
    }
}

export { MapHandler };