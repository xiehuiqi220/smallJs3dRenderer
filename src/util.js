function log() {
    console.log.apply(console, arguments);
}

function rrgb() {//rgb颜色随机
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return {r,g,b};
}

function aabb(points) {
    var start = { x: Infinity, y: Infinity };
    var end = { x: 0, y: 0 };

    for (var i = 0; i < points.length; i++) {
        var p = { x: points[i].__verticeWindowPosition[0], y: points[i].__verticeWindowPosition[1] };

        start.x = p.x < start.x ? p.x : start.x;
        start.y = p.y < start.y ? p.y : start.y;

        end.x = p.x > end.x ? p.x : end.x;
        end.y = p.y > end.y ? p.y : end.y;
    }

    return {
        x0: start.x,
        y0: start.y,
        x1: end.x,
        y1: end.y
    };
}

function substitute_point_in_line(p, pt1, pt2) {
    return ((p.y - pt1.__verticeWindowPosition[1]) * (pt2.__verticeWindowPosition[0] - pt1.__verticeWindowPosition[0])) - ((p.x - pt1.__verticeWindowPosition[0]) * (pt2.__verticeWindowPosition[1] - pt1.__verticeWindowPosition[1]));
}

//判定点在不在多边形里面，https://github.com/anirudhtopiwala/OpenSource_Problems/blob/master/Point_In_Polygon/src/point_in_polygon.cpp
function is_point_inside_convex_polygon(query_point, vertices) {
    const num_sides_of_polygon = vertices.length;
    let count_same_side_results = 0;
    // Iterate over each side.
    for (let i = 0; i < num_sides_of_polygon; ++i) {
        const point_in_line = substitute_point_in_line(query_point,vertices[i], vertices[(i + 1) % num_sides_of_polygon]);
        //console.log(point_in_line);throw "xx";

        // Check if the point lies on the polygon.
        if (point_in_line == 0) {
            return point_in_line;
        }

        count_same_side_results += point_in_line > 0;
    }
    return (Math.abs(count_same_side_results) == num_sides_of_polygon) ? 1 : -1;
}

export { log, rrgb, aabb, is_point_inside_convex_polygon };
