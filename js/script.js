var margin = { top: 5, right: 5, bottom: 5, left: 30 };
var width = 800 - margin.left - margin.right,
    height = 400 - margin.bottom - margin.top;


var svg = d3.select("#map").append("svg")
        .attr({ width: width, height: height})
        .attr("border", "1")

var projection = d3.geo.mercator()
            .scale([100])
            .translate([width / 2.2, height / 1.5]);
var path = d3.geo.path()
            .projection(projection);
            
var color = d3.scale.quantize()
              .range(['rgb(237,248,177)','rgb(127,205,187)','rgb(44,127,184)']);

var formatter = d3.format(",.1f");
    


d3.json("data/world_geo_ru.json", function(karta) {
    d3.json("data/trade_geo.json", function(data) {

            for (var j = 0; j < karta.features.length; j++) {
                for (var i = 0; i < data.length; i++) {
                    if (karta.features[j].properties.name_ru == data[i].country) {
                            karta.features[j].properties.trade =  data[i].trade;
                            karta.features[j].properties.export =  data[i].export;
                            karta.features[j].properties.import =  data[i].import;
                            karta.features[j].properties.saldo =  data[i].saldo;
                    };
                    if (karta.features[j].properties.geounit == "Greenland" && data[i].country == "Дания") {
                            karta.features[j].properties.trade =  data[i].trade;
                            karta.features[j].properties.export =  data[i].export;
                            karta.features[j].properties.import =  data[i].import;
                            karta.features[j].properties.saldo =  data[i].saldo;
                };

            };
}

        color.domain([d3.min(karta.features, function(d) { if (d.properties.sovereignt != "Russia") {return d.properties.trade} }),
                  d3.max(karta.features, function(d) { if (d.properties.sovereignt != "Russia") {return d.properties.trade; }})]);
    
        svg.selectAll("path")
            .data(karta.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", function(d) { if (d.properties.sovereignt == "Belarus") {
                    return "red";
				} else if (!d.properties.trade) {
					return "white";
					} else if (d.properties.sovereignt == "Russia") {
                    return "teal";
                } else {
                    return color(d.properties.trade);
                    }})
            .attr("stroke", "black")
            .on("mouseover", function(d) {
                var xPos = d3.event.pageX + "px";
                var yPos = d3.event.pageY + "px";
                if (d.properties.sovereignt == "Belarus") {
                d3.select("#home")
                    .style("left", xPos)
                    .style("top", yPos)
                    .classed("hidden", false);
				d3.select("#belarus")
                    .text("Страна: Беларусь")
				d3.select("#beltrade")
                    .text("Товарооборот: 42,653.6" )
                d3.select("#belimport")
                    .text("Импорт: 22,180 " )
                d3.select("#belexport")
                    .text("Экспорт: 20,473.6")
                d3.select("#belsaldo")
                    .text("Сальдо: -1,706.4")
			}
                
                else if (!d.properties.trade) {
                d3.select("#tooltip2")
                    .style("left", xPos)
                    .style("top", yPos)
                    .classed("hidden", false);
					d3.select("#strana")
                    .text("Страна: " + d.properties.name_ru)
                    d3.select("#nodata")
                    .text("Нет данных.")
				} else {
				d3.select("#tooltip")
                    .style("left", xPos)
                    .style("top", yPos)
                    .classed("hidden", false);
                d3.select("#country")
                    .text("Страна: " + d.properties.name_ru)
                d3.select("#trade")
                    .text("Товарооборот: " + formatter(d.properties.trade))
                d3.select("#import")
                    .text("Импорт: " + formatter(d.properties.import))
                d3.select("#export")
                    .text("Экспорт: " + formatter(d.properties.export))
                d3.select("#saldo")
                    .text("Сальдо: " + formatter(d.properties.saldo))
}

            })
            .on("mouseout", function(d) {
                d3.select("#tooltip")
                    .classed("hidden", true)
                d3.select("#tooltip2")
                    .classed("hidden", true)
                d3.select("#home")
                    .classed("hidden", true)
                });
        

var legend = svg.append("g")
            .attr("id", "legend")
            .attr("transform", "translate(5, 308)");
      legend.selectAll("rect")
            .data(color.range())
            .enter()
            .append("rect")
            .attr({ x: 10,
                    y: function(d, i) { return i * 20; },
                    width: 15,
                    height: 15,
                    fill: function(d) { return d; },
                    stroke: "black"
                  });
      legend.selectAll("text")
            .data(color.range())
            .enter()
            .append("text")
            .text(function(d) { return "<" + " " + formatter(d3.max(color.invertExtent(d), function(d) { return d; })); })
            .attr({
                x: 30,
                y: function(d, i) { return (i * 20) + 12; }
            });

	svg.append("rect")
            .attr({ x: 15,
                    y: 370,
                    width: 15,
                    height: 15,
                    fill: "teal",
                    stroke: "black"
                  });
             d3.select("svg").append("text")
            .text("= 20,519,979.6")
            .attr({
				id: "russia",
                x: 35,
                y: 380,
            });
    });


});

d3.csv("data/exim_all.csv", function(eximdata) {
	
	var table = d3.select("#tables").append("table");

	var currentYearSelection = eximdata.filter(function(d) { if ((d.type == "I" && d.period == "2015-10")) { return d; }; } );
	var previousYearSelection = eximdata.filter(function(d) { if ((d.type == "I" && d.period == "2014-10")) { return d; }; } );

        currentYearSelection.sort(function(a, b) { return d3.descending(parseInt(a['cost']), parseInt(b['cost'])); });
        previousYearSelection.sort(function(a, b) { return d3.descending(parseInt(a['cost']), parseInt(b['cost'])); });

        var thead = table.append("thead")
			.style("background-color", 'teal')
			.style("color", "white")
			.style("font-weight", "bold");;
        var tbody = table.append("tbody");
        
        thead.append("tr").selectAll("th")
	    .data(["Наименование", "Сумма"])
	    .enter().append("td")
	    .text(function(d) { return d; });


var tr = tbody.selectAll("tr").data(currentYearSelection).enter().append("tr").style('background-color', function (d, i) { return i%2 ? 'white' : '#EDF8B1'; });

        
        var tds = tr.selectAll("td");
        tds.data(function(d) {
			return [d.title, formatter(d.cost)];

				})
        .enter()
        .append("td")
        .text(function(d) { return d; });
        
d3.select("#tables_menu").selectAll("span")
		.on("click", function(d) {
			var selectedItem = d3.select(this);
			var menuItem = d3.select(this).attr("id");
			if (menuItem == "e") {
				d3.select("#I").classed({"active": false})
				d3.select("#e").classed({"active": true})
			} else {
				d3.select("#e").classed({"active": false})
				d3.select("#I").classed({"active": true})
			}

			var menuItem = d3.select(this).attr("id");

			var newData = eximdata.filter(function(d) { if ((d.type == menuItem && d.period == "2015-10")) { return d; }; } );
newData.sort(function(a, b) { return d3.descending(parseInt(a['cost']), parseInt(b['cost'])); });


var update = tbody.selectAll("tr")
	.data(newData);
	
	update.selectAll("td")
	.data(function(d) {
			return [d.title, formatter(d.cost)]
				})

        .text(function(d) { return d; });
				})
});

