/*
Generate points at random locations inside polygon.
    polygon: polygon (Array of points [x,y])
    numPoints: number of points to generate

Returns an Array of points [x,y].

The returned Array will have a property complete, which is set to false if the
desired number of points could not be generated within `options.numIterations` attempts
*/
// https://observablehq.com/@floledermann/dot-density-maps-with-d3
function makeDots(polygons, numPoints, options) {

    options = Object.assign({
        // DEFAULT OPTIONS:
        maxIterations: numPoints * 50,
        distance: options.distance,
        edgeDistance: options.edgeDistance
    }, options);

    numPoints = Math.floor(numPoints)

    // calculate bounding box

    let xMin = Infinity,
        yMin = Infinity,
        xMax = -Infinity,
        yMax = -Infinity

    polygons.forEach((polygon) => {
        polygon.forEach(p => {
            if (p[0] < xMin) xMin = p[0]
            if (p[0] > xMax) xMax = p[0]
            if (p[1] < yMin) yMin = p[1]
            if (p[1] > yMax) yMax = p[1]
        })
    });

    let width = xMax - xMin
    let height = yMax - yMin

    // default options depending on bounds

    options.distance = options.distance || Math.min(width, height) / numPoints / 4
    options.edgeDistance = options.edgeDistance || options.distance

    // generate points

    let points = [];

    outer:
    for (let i = 0; i < options.maxIterations; i++) {
        let p = [xMin + Math.random() * width, yMin + Math.random() * height]
        if (polygons.some(polygon => d3.polygonContains(polygon, p))) {
            // check distance to other points
            for (let j = 0; j < points.length; j++) {
                let dx = p[0] - points[j][0],
                    dy = p[1] - points[j][1]

                if (Math.sqrt(dx * dx + dy * dy) < options.distance) continue outer;
            }
            // check distance to polygon edge
            for (let polygon of polygons) {
                for (let j = 0; j < polygon.length - 1; j++) {
                    if (distPointEdge(p, polygon[j], polygon[j + 1]) < options.edgeDistance) continue outer;
                }
            }
            points.push(p);
            if (points.length == numPoints) break;
        }
    }

    points.complete = (points.length >= numPoints)

    return points
}

// ported from https://stackoverflow.com/q/30559799
function distPointEdge(p, l1, l2) {

    let A = p[0] - l1[0],
        B = p[1] - l1[1],
        C = l2[0] - l1[0],
        D = l2[1] - l1[1];

    let dot = A * C + B * D;
    let sq = C * C + D * D;

    // alpha is proportion of closest point on the line between l1 and l2
    let alpha = -1;
    if (sq != 0) //in case of 0 length line
        alpha = dot / sq;

    // points on edge closest to p
    let X, Y;

    if (alpha < 0) {
        X = l1[0];
        Y = l1[1];
    }
    else if (alpha > 1) {
        X = l2[0];
        Y = l2[1];
    }
    else {
        X = l1[0] + alpha * C;
        Y = l1[1] + alpha * D;
    }

    let dx = p[0] - X;
    let dy = p[1] - Y;

    return Math.sqrt(dx * dx + dy * dy);
}

export {makeDots};