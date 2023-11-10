import {
    asc,
    sum,
    mean,
    std,
    quantile,
    q25,
    q50,
    q75,
    median
} from "./violin_utils.js";

class ViolinHandler {

    constructor() {
        this._options = {
            chartWidth: 500,
            chartHeight: 500,
            backgroundColor: "#EAF2FA",
            fillColor: "#09A573",
            stokeColor: "#09A573",
            markerColor: "#000000",
            nBins: 10
        };
        this._container;
        this._data;
        this._columnX;
        this._columnY;
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

    data(data) {
        this._data = data;
        return this;
    }

    columnX(columnX) {
        this._columnX = columnX;
        return this;
    }

    columnY(columnY) {
        this._columnY = columnY;
        return this;
    }

    xCategorizer(xCategorizer) {
        this._xCategorizer = xCategorizer;
        return this;
    }

    categorize(d) {
        if (typeof this._xCategorizer == "function") {
            return this._xCategorizer(d);
        } else {
            return d;
        }
    }

    // https://d3-graph-gallery.com/graph/violin_basicHist.html
    createGraph() {
        if (this._svg) {
            d3.select("svg").remove();
        }

        this._margin = {
            top: this._options.chartHeight * 0,
            right: this._options.chartWidth * 0,
            bottom: this._options.chartHeight * 0.1,
            left: this._options.chartWidth * 0.15
        };
        let width = this._options.chartWidth - this._margin.left - this._margin.right;
        let height = this._options.chartHeight - this._margin.top - this._margin.bottom;

        this._svg = d3.create("svg")
            .attr("title", "Violin")
            .attr("width", this._options.chartWidth)
            .attr("height", this._options.chartHeight);

        this._svg.append("g")
            .attr("transform",
                "translate(" + this._margin.left + "," + this._margin.top + ")");

        this._svg.select("g").append("rect")
            .attr("width", this._options.chartWidth - this._margin.left - this._margin.right)
            .attr("height", this._options.chartHeight - this._margin.top - this._margin.bottom)
            .attr("fill", this._options.backgroundColor);

        let dataY = this._data.map(d => d[this._columnY]);
        let minY = Math.min(...dataY);
        let maxY = Math.max(...dataY);

        // y scale
        this._y = d3.scaleLinear()
            .domain([minY, maxY])
            .range([height, 0]);
        this._svg.select("g").append("g")
            .call(d3.axisLeft(this._y));

        // labels
        this._svg.select("g")
            .append("text")
            .attr("text-anchor", "middle")
            .attr("x", (this._options.chartWidth - this._margin.left - this._margin.right) / 2)
            .attr("y", this._options.chartHeight - this._margin.top - this._margin.bottom / 4)
            .attr("class", "x_label")
            .text("Años de Experiencia");

        this._svg.select("g")
            .append("text")
            .attr("text-anchor", "end")
            .attr("x", -this._margin.left * 0.4)
            .attr("y", (this._options.chartHeight - this._margin.top - this._margin.bottom) / 2)
            .attr("class", "y_label")
            .text("Salario ($)");

        return this;
    }

    updateCategories() {
        this._svg.select("#violins").remove();
        this._svg.select("#x_scale").remove();

        let dataX = this._data.map(d => this.categorize(d[this._columnX]));
        let labelsX = [...new Set(dataX)];
        labelsX.sort((l1, l2) => {
            let regex = /\d+/g;
            let v1 = Math.max(...l1.match(regex));
            let v2 = Math.max(...l2.match(regex));

            if (v1 == v2) {
                return l1[0].localeCompare(l2[0]);
            } else {
                return v1 - v2;
            }
        });

        // x scale
        let x = d3.scaleBand()
            .range([0, this._options.chartWidth - this._margin.left - this._margin.right])
            .domain(labelsX)
            .padding(0.05);
        this._svg.select("g").append("g")
            .attr("transform", "translate(0," + (this._options.chartHeight - this._margin.top - this._margin.bottom) + ")")
            .attr("id", "x_scale")
            .call(d3.axisBottom(x));

        // Features of the histogram
        let histogram = d3.histogram()
            .domain(this._y.domain())
            .thresholds(this._y.ticks(this._options.nBins))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .value(d => d);

        // Compute the binning for each group of the dataset
        let sumstat = d3.nest()  // nest function allows to group the calculation per level of a factor
            .key(d => this.categorize(d[this._columnX]))
            .rollup(d => {   // For each key..
                let input = d.map(g => g[this._columnY])
                let bins = histogram(input)   // And compute the binning on it.
                return (bins)
            })
            .entries(this._data);

        // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
        let maxNum = 0
        for (let i in sumstat) {
            let allBins = sumstat[i].value
            let lengths = allBins.map(a => a.length)
            let longest = d3.max(lengths)
            if (longest > maxNum) { maxNum = longest }
        };

        // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
        var xNum = d3.scaleLinear()
            .range([0, x.bandwidth()])
            .domain([-maxNum, maxNum]);

        // Add the shape to this svg!
        let g = this._svg.select("g")
            .append("g")
            .attr("id", "violins")
            .selectAll(null)
            .data(sumstat)
            .enter()        // So now we are working group per group
            .append("g")
            .attr("transform", d => "translate(" + x(d.key) + ", 0)"); // Translation on the right to be at the group position

        g.append("path")
            .datum(d => d.value)     // So now we are working bin per bin
            .style("stroke", this._options.stokeColor)
            .style("fill", this._options.fillColor)
            .attr("d", d3.area()
                .x0(d => xNum(-d.length))
                .x1(d => xNum(d.length))
                .y(d => this._y(d.x0))
                .curve(d3.curveCatmullRom)   // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
                // .curve(d3.curveStep)
            );

        const boxWidth = 10;

        // Q1 to Q3 box
        g.append("rect")
            .attr("width", boxWidth)
            .attr("height", d => {
                let flat = asc(d.value.flat());
                let q1 = q25(flat);
                let q3 = q75(flat);
                return this._y(q1) - this._y(q3);
            })
            .attr("x", xNum(0) - boxWidth / 2)
            .attr("y", d => this._y(q75(d.value.flat())))
            .attr("stroke", this._options.markerColor)
            .attr("fill", "#00000000");

        // Q3 to Q3+1.5*IQR line
        g.append("line")
            .attr("x1", xNum(0))
            .attr("y1", d => this._y(q75(d.value.flat())))
            .attr("x2", xNum(0))
            .attr("y2", d => {
                let flat = asc(d.value.flat());
                let q1 = q25(flat);
                let q3 = q75(flat);
                let iqr = q3 - q1;
                return this._y(Math.min(q3 + 1.5 * iqr, flat[flat.length - 1]));
            })
            .attr("stroke", this._options.markerColor)

        // Q3+1.5*IQR line
        g.append("line")
            .attr("x1", xNum(0) - boxWidth / 2)
            .attr("y1", d => {
                let flat = asc(d.value.flat());
                let q1 = q25(flat);
                let q3 = q75(flat);
                let iqr = q3 - q1;
                return this._y(Math.min(q3 + 1.5 * iqr, flat[flat.length - 1]));
            })
            .attr("x2", xNum(0) + boxWidth / 2)
            .attr("y2", d => {
                let flat = asc(d.value.flat());
                let q1 = q25(flat);
                let q3 = q75(flat);
                let iqr = q3 - q1;
                return this._y(Math.min(q3 + 1.5 * iqr, flat[flat.length - 1]));
            })
            .attr("stroke", this._options.markerColor)

        // Q1 to Q1-1.5*IQR line
        g.append("line")
            .attr("x1", xNum(0))
            .attr("y1", d => this._y(q25(d.value.flat())))
            .attr("x2", xNum(0))
            .attr("y2", d => {
                let flat = asc(d.value.flat());
                let q1 = q25(flat);
                let q3 = q75(flat);
                let iqr = q3 - q1;
                return this._y(Math.max(q1 - 1.5 * iqr, flat[0]));
            })
            .attr("stroke", this._options.markerColor)

        // Q1-1.5*IQR line
        g.append("line")
            .attr("x1", xNum(0) - boxWidth / 2)
            .attr("y1", d => {
                let flat = asc(d.value.flat());
                let q1 = q25(flat);
                let q3 = q75(flat);
                let iqr = q3 - q1;
                return this._y(Math.max(q1 - 1.5 * iqr, flat[0]));
            })
            .attr("x2", xNum(0) + boxWidth / 2)
            .attr("y2", d => {
                let flat = asc(d.value.flat());
                let q1 = q25(flat);
                let q3 = q75(flat);
                let iqr = q3 - q1;
                return this._y(Math.max(q1 - 1.5 * iqr, flat[0]));
            })
            .attr("stroke", this._options.markerColor)

        // Median line
        g.append("line")
            .attr("x1", xNum(0) - boxWidth / 2)
            .attr("y1", d => this._y(median(d.value.flat())))
            .attr("x2", xNum(0) + boxWidth / 2)
            .attr("y2", d => this._y(median(d.value.flat())))
            .attr("stroke", this._options.markerColor)

        return this;
    }

    updateGraph() {
        this._container.append(this._svg.node());

        return this;
    }
}

export { ViolinHandler };