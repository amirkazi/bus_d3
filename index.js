/* global d3 */
var routes;
var lollapalooza
var bus_list

/* Inspired from book: Interactive Data Viz */

//Reading Bus Route Data
d3.json("CTA_BusRoutes.geojson", function(error, data) {
  if (error) {
    console.log(error);
    console.log('just got an error!')
  } else {
    console.log(data);
    routes = data;
    make_map(routes);
  }});


// Reading Lollapalooza Demand Data
d3.json("lollapalooza.json", function(error, data) {
  if (error) {
    console.log(error);
    console.log('just got an error!')
  } else {
    console.log(data);
    lollapalooza = data;
    make_line_chart(lollapalooza);
  }});


// Reading List of Buses
d3.csv("bus_list.csv", function(error, data) {
  if (error) {
    console.log(error);
    console.log('just got an error!')
  } else {
    console.log(data);
    bus_list = data;
    make_drop_down(bus_list);
  }});


//making drop down menu
function make_drop_down(dataset){
  //with help from:
  // https://blockbuilder.org/micahstubbs/d393bcfde0228430c00b
  var selector = d3.select("body")
		.append("select")
    .attr("class","drop_down")
		.attr("id", "bus_selector")
		.selectAll("option")
		.data(dataset)
		.enter().append("option")
		.text(function(d) { return d.bus_route_name; })
		.attr("value", function (d) {return d.bus_route_name})
    // .on("change",  function() {
    //                   var selection = eval(d3.select(this).property('value'));
    //                   use_drop_down(selection)});
    .on("change", function(d){console.log('drop down changed')});
}

function use_drop_down(selection){
  console.log(selection);
  console.log("john cena");
}



// Creating Map for Chicago
function make_map(routes){
  var map_width = 600;
  var map_height = 1100;

  // with help from:
  // https://gis.stackexchange.com/questions/180675/d3-center-a-map-feature-using-correct-latitude-and-longitude-without-rotation
  var projection = d3.geoAlbers()
                    .scale(99000)
                    .center([0, 41.83])
                    .rotate([87.65, 0])
                    .parallels([40, 45])
                    .translate([map_width / 1.5, map_height / 2]);

  var geoGenerator = d3.geoPath(projection);

  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 60);

  var svg_map = d3.select(".map")
        .append("svg")
        .attr("width", map_width)
        .attr("height", map_height)
        .selectAll('path')
        .data(routes.features)
        .enter()
        .append('path')
        .attr("class","route_class")
        .attr("d", geoGenerator)
        .attr("id", function(d) { return "bus" + d.properties.ROUTE;})
        .attr('stroke', 'black')
        .attr('fill', "white")
        // .style("stroke-width", "1")
        .on("mouseover", function(d) {
            tooltip.transition()
            .duration(200)
            .style("opacity", 20);
            tooltip.html(d.properties.ROUTE + ": " + d.properties.Name)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY + 40) + "px");
          })
        .on("mouseout", function(d) {
            tooltip.transition()
            .duration(300)
            .style("opacity", 0);
          })
        .on("click", function(d) {
          highlight_map_route(d.properties.ROUTE);
          highlight_line_chart_route(d.properties.ROUTE);
        });
}




function highlight_map_route(route){
  console.log("route over here:");
  console.log(route);
  d3.selectAll(".route_class").classed("highlight", false);
  d3.select("#bus" + route).classed("highlight", true);


  // //d3.selectAll("route_class").classed("highlight", false);
  // d3.select("route").classed("highlight", true);
  //
  // d3.selectAll("route_class").transition()
  // .style('fill', 'red')
  // //d3.select(route).classed("highlight", true);
  //
  // //d3.selectAll("line_class").classed("highlight", false);
  // //d3.select("#line" + route).classed("highlight", true);



};

function highlight_line_chart_route(route){
    d3.selectAll(".lines").classed("highlight", false);
    d3.select("#line" + route).classed("highlight", true);
};



function make_line_chart(data){

  // Inspiration from:
  // https://medium.freecodecamp.org/learn-to-create-a-line-chart-using-d3-js-4f43f1ee716b

  var chart_width = 600, chart_height = 500;
  var margin = { top: 40, right: 20, bottom: 50, left: 100 };
  var width = chart_width - margin.left - margin.right;
  var height = chart_height - margin.top - margin.bottom;


  var svg_line_chart = d3.select(".linechart")
        .append("svg")
        .attr("width", chart_width)
        .attr("height", chart_height)

  var g = svg_line_chart.append("g")
                        .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")"
   ).attr("id","linechart_g");

   var x = d3.scaleLinear().rangeRound([0, width]);
   var y = d3.scaleLinear().rangeRound([height, 0]);


   var line = d3.line()
   .x(function(d) { return x(d.days)})
   .y(function(d) { return y(d.riders)});

   //x.domain(d3.extent(data, function(d) { return d.demand[0].days }));
   x.domain(d3.extent(data, function(d) { return d.demand[1].days }));
   y.domain(d3.extent(data, function(d) { return d.demand[1].riders } ));


   g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .select(".domain");
      //.remove();

    g.append("g")
     .call(d3.axisLeft(y))
     .append("text")
     .attr("fill", "#000")
     .attr("transform", "rotate(-90)")
     .attr("y", 6)
     .attr("dy", "-4em")
     .attr("dx", "-12em")
     .attr("text-anchor", "middle")
     .attr("font-size", "18px")
     .text("Number of Bus Riders");

     console.log("This Data!");
     console.log(data);
     console.log(data.filter(function(item) { return item.route == "1"}));
     var lim = data.filter(function(item) { return item.route == "1"});
     console.log(lim[0].demand);
     var demand = lim[0].demand;

     d3.select("#linechart_g")
      .selectAll(".lines")
      .data(data, function(d) {return d.route})
      .enter()
      .append("path")
      .attr("class","lines")
      .attr("d", function(d) { return line(d.demand)})
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("id", function(d) { return ( "line" + d.route )});


     // g.data(data)
     //   .enter()
     //   .datum(function(d) {return d.demand[1]})
     //   //.datum(function(d) {return d})
     //   .append("path")
     //   .attr("d", line)
     //   .attr("fill", 'blue')
     //   .attr("id", function(d) { return ( "line" + d.route )});


/*
    g.data(data)
      .enter()
      .datum(function(d) {return d.demand})
      .append("path")
      .attr("d", line)
      .attr("class", "line_class")
      .attr("id", function(d) { return ( "line" + d.route )});

      */
};


/*




// Handler for dropdown value change
var dropdownChange = function() {
    var newCereal = d3.select(this).property('value'),
        newData   = cerealMap[newCereal];

    updateBars(newData);
};


function drop_down(bus_list){
  var sorted_bus_list = Object.keys(bus_list).sort();

  var dropdown = d3.select("#vis-container")
                    .insert("select", "svg")
                    .on("change", dropdownChange);



Ignore old debugs:
//d3.select("X49").attr("fill", "#ccc");
//console.log(d.properties.ROUTE);
//d3.select(d.properties.ROUTE).classed("highlight", true);
//d3.selectAll(".route_class").classed("highlight", true).moveToFront();
//console.log("path#" + d.properties.ROUTE + ".route_class");
//d3.select("path#" + d.properties.ROUTE + ".route_class").classed("highlight", true);
//d3.select("#" + d.properties.ROUTE + ".route_class").classed("highlight", true);
//d3.select("#" + d.properties.ROUTE).classed("highlight", true);
//d3.select("#X49").classed("highlight", true);
//d3.select("#J14").classed("highlight", true);
//d3.select("#bus74").classed("highlight", true);
//d3.select("#bus" + d.properties.ROUTE).classed("highlight", true);
//console.log("button pressed")

}

*/
