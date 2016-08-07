        var xColumn = "xValue";
        var yColumn = "yValue";
        var xTitle = "percentile" 
        var yTitle = "RTT/2";

        // basic SVG setup
        var margin = {
            top: 20,
            right: 100,
            bottom: 40,
            left: 100
        };
        var height = 500 - margin.top - margin.bottom;
        var width = 760 - margin.left - margin.right;



        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // setup scales - the domain is specified inside of the function called when we load the data
        var xScale = d3.scale.linear().range([0, width]);
        var yScale = d3.scale.linear().range([height, 0]);
        var color = d3.scale.category10();

        // setup the axes
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
        var yAxis = d3.svg.axis().scale(yScale).orient("left");

        // set the line attributes
        var line = d3.svg.line()
            .interpolate("basis")
            .x(function(d) {
                return xScale(d[xColumn]);
            })
            .y(function(d) {
                return yScale(d[yColumn]);
            });

        var focus = svg.append("g").style("display", "none");

        // import data and create chart
        function type(d) {
            d.xValue = +d.xValue;
            d.yValue = +d.yValue;
            return d;
        }

        function render(data) {
            // create dataset array 
            var dataset = d3.keys(data[0]).filter(function(key) {
                return key !== xTitle;
            }).map(function(name) {
                return {
                    name: name,
                    values: data.map(function(d) {
                        return {
                            xValue: d[xTitle],
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
            color.domain(dataset.map(function(d) {return d.name;  }));


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
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            // add the y axis
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -60)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(yTitle);
                
            // add the line series
            var series = svg.selectAll(".seriesXYZ")
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
                .style("stroke", function(d) {
                    return color(d.name);
                });

            // add the series labels at the right edge of chart
            var maxLen = data.length;
            series.append("text")
                .datum(function(d) {
                    return {
                        name: d.name,
                        value: d.values[maxLen - 1]
                    };
                })
                .attr("transform", function(d) {
                    return "translate(" + xScale(d.value[xColumn]) + "," + yScale(d.value[yColumn]) + ")";
                })
                .attr("id", function(d, i) {
                    return "text_id" + i;
                })
                .attr("x", 3)
                .attr("dy", ".35em")
                .text(function(d) {
                    return d.name;
                });
        }

        render(data);
