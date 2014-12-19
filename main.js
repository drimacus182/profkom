var margin = {top: 20, right: 30, bottom: 67, left: 40},
    w = 960 - margin.left - margin.right,
    h = 500 - margin.top - margin.bottom;

var chart = d3.select(".chart")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
    .style("border", "1px solid blue")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

chart.append("g")
    .attr("class", "y axis")
    .append("text")
    .attr("class", "caption")
    .attr("x", -35)
    .attr("y", -7)
    .text("тис. грн");
chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + h + ")");

var trans_duration = 500;

/*
var colors = {
    income: {
        fill: "teal",
        hover: "steelblue"
    },
    outcome: {
        fill: "white",
        hover: "red"
    },
    mat_help: {
        fill: "green",
        hover: "black"
    },
    prem: {
        fill: "orange",
        hover: "gray"
    },
    events: {
        fill: "orangered",
        hover: "redorange"
    },
    members: {
        fill: "white",
        hover: "white"
    }
};
*/

// -- Formats --
var p_f = d3.format('%');
var comma_f = d3.format(",");
var num_f = function(input) {
    return comma_f(input).replace(",", " ");
};

var tip = createTip();

d3.select("#main_container")
    .on('mouseenter', tip.hide);
//    .on('mouseleave', tip.hide);


d3.json("2.json", function (loaded_data) {
    $("input[name=order_cat]:radio").change(function () {
        tip.hide();
        drawGraph(reorderData(loaded_data));
    });

    drawGraph(reorderData(loaded_data));
});

function drawGraph(dataset) {
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
        .tickFormat(function (d) {return d3.format("s")(d).replace('k', '');});

    reDrawAxisY(chart, yAxis);

    drawBars(dataset, x, y, "mat_help", 10, function (d) {return y(d.outcome.mat_help.val);});
    drawBars(dataset, x, y, "prem", 10, function (d) {return y(d.outcome.prem.val);});
    drawBars(dataset, x, y, "events", 10, function (d) {return y(d.outcome.events);});
    drawBars(dataset, x, y, "outcome", 10, function(d) {return y(d.outcome.total);});
    drawBars(dataset, x, y, "income", 0, function(d) {return y(d.income);});

    reDrawAxisX(chart, xAxis);

    chart.call(tip);

    chart.selectAll(".prem")
        .attr("y", function(d) { return y(d.outcome.mat_help.val + d.outcome.prem.val);});

    chart.selectAll(".events")
        .attr("y", function(d) { return y(d.outcome.total);});

    chart.selectAll(".income, .outcome")
        .on('mouseover', tip.show);
}

function reDrawAxisX(chart, xAxis) {
    var gx = chart.selectAll(".x.axis");

    gx.transition()
        .duration(trans_duration)
        .call(xAxis);
    gx
        .selectAll("text")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start")
        .attr("dx", 9)
        .attr("dy", -6);
}

function reDrawAxisY(chart, yAxis) {
    var gy = chart.selectAll(".y.axis");
    gy.call(yAxis);
    gy
        .selectAll("g")
        .classed("minor", true);
    gy
        .selectAll("text:not(.caption)")
        .attr("x", -5)
        .style("text-anchor", "end");
}

function drawBars(data, x, y, cssClass, dx, yAttr) {
    var bars = chart.selectAll("." + cssClass)
        .data(data, function (d) {return d.name;});
    bars
        .enter()
        .append("rect")
        .attr("class", cssClass);
    bars
        .attr("y", yAttr)
        .attr("width", 15)
        .attr("height", function (d) {
            return h - yAttr(d);
        })
//        .attr("fill", colors[cssClass].fill)
        .transition()
        .duration(trans_duration)
        .attr("x", function (d) {
            return x(d.name) + dx;
        });
}

function createTip() {
    return d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            var income = num_f(d.income);
            var outcome = num_f(d.outcome.total);
            var mat_h = num_f(d.outcome.mat_help.val);
            var prem = num_f(d.outcome.prem.val);
            var events = num_f(d.outcome.events);
            var members = num_f(d.members);
            var out_p = p_f(d.outcome.total / d.income);

            return  "<p class='center'>" + d.name + "</p>" +
                    "<table id='tip_table'>" +
                    "<tr><td class='col1'>Надходження:</td> <td class='col2 income'>" + income + "</td></tr>" +
                    "<tr><td class='col1'>Витрати:</td> <td class='col2'><span>" + outcome + "</span><span style='color:lightgray'>&nbsp;(" + out_p + ")</span></td></tr>" +
                    "<tr><td class='col1'>Мат. допомога:</td> <td class='col2'><span class='mat_help'>" + mat_h + "</span></td></tr>" +
                    "<tr><td class='col1'>&nbsp;&nbsp;&nbsp;&nbsp;Премії:</td> <td class='col2'><span class='prem'>" + prem + "</span></td></tr>" +
                    "<tr><td class='col1'>&nbsp;&nbsp;&nbsp;&nbsp;Заходи:</td> <td class='col2'><span  class='events'>" + events + "</span></td></tr>" +
                    "<tr><td class='col1'>Членів:</td> <td class='col2'><span>" + members + "</span></td></tr>" +
                    "</table>";
        });
}

function reorderData(data) {
    var order_cat = $('input[name=order_cat]:checked').val();

    if (order_cat == "income") return data.sort(function(a, b) {
            return b.income - a.income;
        });

    if (order_cat == "outcome") return data.sort(function(a, b) {
        return b.outcome.total - a.outcome.total;
    });

    if (order_cat == "out_rate") return data.sort(function(a, b) {
        return b.outcome.total / b.income - a.outcome.total / a.income;
    });
}

function downloadFile(dataset) {
    var url = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(dataset));
    window.open(url, '_blank');
    window.focus();
}
