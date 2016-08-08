        var xColumn = "xValue";
        var yColumn = "yValue";

        var xAxisLabelText = "percentile";
        var yAxisLabelText = "RTT/2";

        // basic SVG setup
        var outerWidth = 800;
        var outerHeight = 600;
        var legendHeight = 100;

        var margin = {
            left: 70,
            top: 5,
            right: 5,
            bottom: 70
        };
        var xAxisLabelOffset = 48;
        var yAxisLabelOffset = 40;
        var innerWidth = outerWidth - margin.left - margin.right;
        var innerHeight = outerHeight - margin.top - margin.bottom - legendHeight;
        var legendY = innerHeight + xAxisLabelOffset + 30;


        var svg = d3.select("body").append("svg")
            .attr("width", outerWidth)
            .attr("height", outerHeight);
        var g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xAxisG = g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + innerHeight + ")")
        var xAxisLabel = xAxisG.append("text")
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + (innerWidth / 2) + "," + xAxisLabelOffset + ")")
            .attr("class", "label")
            .text(xAxisLabelText);
        var yAxisG = g.append("g")
            .attr("class", "y axis");
        var yAxisLabel = yAxisG.append("text")
            .style("text-anchor", "middle")
            .attr("transform", "translate(-" + yAxisLabelOffset + "," + (innerHeight / 2) + ") rotate(-90)")
            .attr("class", "label")
            .text(yAxisLabelText);

        // setup scales - the domain is specified inside of the function called when we load the data
        var xScale = d3.scale.linear().range([0, innerWidth]);
        var yScale = d3.scale.linear().range([innerHeight, 0]);
        var color = d3.scale.category10();

        // setup the axes
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
            .ticks(10)
            .outerTickSize(0);
        var yAxis = d3.svg.axis().scale(yScale).orient("left")
            .ticks(5)
            .outerTickSize(0);

        // set the line attributes
        var line = d3.svg.line()
            .interpolate("basis")
            .x(function(d) {
                return xScale(d[xColumn]);
            })
            .y(function(d) {
                return yScale(d[yColumn]);
            });

        // import data and create chart
        function type(d) {
            d.xValue = +d.xValue;
            d.yValue = +d.yValue;
            return d;
        }

        function render(data) {
            // create dataset array 
            var dataset = d3.keys(data[0]).filter(function(key) {
                return key !== xAxisLabelText;
            }).map(function(name) {
                return {
                    name: name,
                    values: data.map(function(d) {
                        return {
                            xValue: d[xAxisLabelText],
                            yValue: d[name]
                        };
                    })
                };
            });

            // For each seri, sort data ascending - needed to get correct bisector results
            dataset.forEach(function(d) {
                d.values.forEach(type)
                d.values.sort(function(a, b) {
                    return a[xColumn] - b[xColumn];
                });
            })

            // color domain
            color.domain(dataset.map(function(d) {
                return d.name;
            }));


            // add domain ranges to the x and y scales
            xScale.domain([
                d3.min(dataset, function(c) {
                    return d3.min(c.values, function(v) {
                        return v[xColumn];
                    });
                }),
                d3.max(dataset, function(c) {
                    return d3.max(c.values, function(v) {
                        return v[xColumn];
                    });
                })
            ]);
            yScale.domain([
                0,
                d3.max(dataset, function(c) {
                    return d3.max(c.values, function(v) {
                        return v[yColumn];
                    });
                })
            ]);

            // add the x axis
            xAxisG.call(xAxis);
            yAxisG.call(yAxis);

            // add the line series
            var series = g.selectAll(".seriesXYZ")
                .data(dataset)
                .enter().append("g")
                .attr("class", "seriesXYZ");

            // add the paths
            series.append("path")
                .attr("class", "line")
                .attr("id", function(d, i) {
                    return "id" + i;
                })
                .attr("d", function(d) {
                    return line(d.values);
                })
                .attr('stroke-width', 3)
                .attr("data-legend", function(d) {
                    return d.name
                })
                .style("stroke", function(d) {
                    return color(d.name);
                });

            // add the series labels at the right edge of chart
            var legend = g.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + 0 + "," + legendY + ")")
                .style("font-size", "12px")
                .call(d3.legend)
        }

        render(data);