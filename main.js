var margin = {top: 20, right: 30, bottom: 50, left: 40},
    w = 960 - margin.left - margin.right,
    h = 500 - margin.top - margin.bottom;

var chart = d3.select(".chart")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
    .style("border", "1px solid blue")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var colors = {
    income: {
        fill: "teal",
        hover: "steelblue"
    },
    outcome: {
        fill: "orange",
        hover: "red"
    },
    mat_help: {
        fill: "green",
        hover: "black"
    },
    prem: {
        fill: "orangered",
        hover: "gray"
    },
    events: {
        fill: "crimson",
        hover: "redorange"
    },
    members: {
        fill: "white",
        hover: "white"
    }
};

d3.json("/2.json", function (dataset) {
    dataset = dataset.sort(function (a, b) {
//        return b.outcome.total/ b.income - a.outcome.total/ a.income;
        return b.outcome.total - a.outcome.total;
    });

    var y = d3.scale.linear()
        .domain([0, d3.max(dataset, function (data) {
            return data.income;
        })])
        .range([h, 0]);

    var x = d3.scale.ordinal()
        .domain(dataset.map(function(d) { return d.name; }))
        .rangeRoundBands([0, w], .1);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right")
        .ticks(10)
        .tickSize(w)
        .tickFormat(d3.format("s"));

    drawAxisY(chart, yAxis);

    drawBars(dataset, x, y, "mat_help", 10, function (d) {return y(d.outcome.mat_help.val);});
    drawBars(dataset, x, y, "prem", 10, function (d) {return y(d.outcome.prem.val);});
    drawBars(dataset, x, y, "events", 10, function (d) {return y(d.outcome.events);});
    drawBars(dataset, x, y, "outcome", 10, function(d) {return y(d.outcome.total);});
    drawBars(dataset, x, y, "income", 0, function(d) {return y(d.income);});

    drawAxisX(chart, xAxis);

    var tip = createTip();
    chart.call(tip);

//    chart.selectAll(".mat_help")
//        .attr("opacity", "0.5");

    chart.selectAll(".prem")
//        .attr("opacity", "0.5")
        .attr("y", function(d) { return y(d.outcome.mat_help.val + d.outcome.prem.val);});

    chart.selectAll(".events")
//        .attr("opacity", "0.5")
        .attr("y", function(d) { return y(d.outcome.total);});

    chart.selectAll(".outcome")
        .attr("opacity", "0.0");

    chart.selectAll(".income, .outcome")
        .on('mouseover', tip.show)
//        .on('mouseout', tip.hide);


//    chart.selectAll("text.value")
//        .data(dataset)
//        .enter()
//        .append("text")
//        .attr("class", "value")
//        .text(function (d) {
//            return d.income;
//        })
//        .attr("x", function(d) {return x(d.name) + 10;})
//        .attr("y", function (d, i) {
//            return y(d.income);
//        })
//        .style("text-anchor", "middle");


});

function drawAxisX(chart, xAxis) {
    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start")
        .attr("dx", 9)
        .attr("dy", -6);
}

function drawAxisY(chart, yAxis) {
    var gy = chart.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    gy
        .selectAll("g")
//        .filter(function(d){return d;})
        .classed("minor", true);

    gy
        .selectAll("text")
        .attr("x", -5)
        .style("text-anchor", "end");

//    gy
//        .append("text")
//        .attr("transform", "rotate(-90)")
//        .attr("y", 6)
//        .attr("dy", "-2.0em")
//        .style("text-anchor", "end")
//        .text("Money!");
}

function drawBars(data, x, y, cssClass, dx, yAttr) {
    chart.selectAll("." + cssClass)
        .data(data)
        .enter()
        .append("rect")
        .attr("class", cssClass)
        .attr("x", function (d) {
            return x(d.name) + dx;
        })
        .attr("y", yAttr)
        .attr("width", 15)
        .attr("height", function (d) {
            return h - yAttr(d);
        })
        .attr("fill", colors[cssClass].fill)
        .on("mouseover")
}

function createTip() {
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return  "<p class='center'>" + d.name + "</p>" +
                    "<strong>Надходження:</strong> <span style='color:" + colors["income"].fill + "'>" + d.income + "</span><br/>" +
                    "<strong>Витрати:</strong> <span style='color:" + colors["outcome"].fill + "'>" + d.outcome.total + "</span><br/>" +
                    "<strong>&nbsp;&nbsp;&nbsp;&nbsp;Мат. допомога:</strong> <span style='color:" + colors["mat_help"].fill + "'>" + d.outcome.mat_help.val + "</span><br/>" +
                    "<strong>&nbsp;&nbsp;&nbsp;&nbsp;Премії:</strong> <span style='color:" + colors["prem"].fill + "'>" + d.outcome.prem.val + "</span><br/>" +
                    "<strong>&nbsp;&nbsp;&nbsp;&nbsp;Заходи:</strong> <span style='color:" + colors["events"].fill + "'>" + d.outcome.events + "</span><br/>" +
                    "<strong>Членів:</strong> <span style='color:" + colors["members"].fill + "'>" + d.members + "</span>";
        });

    return tip;
}
function downloadFile(dataset) {
    var url = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(dataset));
    window.open(url, '_blank');
    window.focus();
}

/*chart.selectAll("text.fac")
 .data(dataset)
 .enter()
 .append("text")
 .attr("class", "fac")
 .text(function (d) {
 return d.name;
 })
 .attr("x", function (d, i) {
 return x(d.name) + 15;
 })
 .attr("y", h + 10)
 .style("text-anchor", "middle");
 */
