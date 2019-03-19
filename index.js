

document.addEventListener('DOMContentLoaded', () => {
  // this uses a structure called a promise to asyncronously get the data set
  // use Promise.all to load in more than one dataset
  Promise.all([
      './data/CTA_BusRoutes.geojson',
      './data/neighborhoods_2012.geojson',
      './data/bus_list.json',
      './data/lollapalooza.json',
      './data/monthly_usage.json',
      './data/daily_usage.json'
    ].map(url => fetch(url).then(data => data.json())))
      .then(data => myVis(data))
    .catch(function(error){
        console.log(`An unexpected error occured: ${error}`,error);
    });
});



function myVis(data) {
  var [routes, neighborhoods, bus_list, lollapalooza_usage, monthly_usage,
      daily_usage] = data;

  // set the dimensions and margins of the graph
  var margin = {top: 50, right: 50, bottom: 50, left: 50},
      width = 900 - margin.left - margin.right,
      height = 1300 - margin.top - margin.bottom;

  // makes routes map from
  make_map(neighborhoods, true);
  make_map(routes, false);

  // make line chart
  make_line_chart(lollapalooza_usage);

  //make drop down
  make_drop_down(bus_list)


  console.log ("This works");
}




// d3.select("#button_id").on("click", updateFunction(bus_list));




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
		.attr("value", function (d) {return d.bus_route_name});

    d3.select("#bus_selector").on("change", function() {

      var value = d3.select(this)
        .property("value")

      highlight_map_route(value);
      highlight_line_chart_route(value);
    });
};


//
// function dropdownChange(route) {
//   highlight_map_route(route);
//   highlight_line_chart_route(route);
// }
//
//
// //
// // var dropdownChange = function() {
// //                     var newCereal = d3.select(this).property('value'),
// //                         newData   = cerealMap[newCereal];
// //
// //                     updateBars(newData);
// //                 };
//
//
//
// Creating Map
function make_map(routes, isNeighborhoods){
  var map_width = 600;
  var map_height = 1100;

  // with help from:
  // https://gis.stackexchange.com/questions/180675/d3-center-a-map-feature-using-correct-latitude-and-longitude-without-rotation
  // https://d3indepth.com/geographic/
  var projection = d3.geoAlbers()
                    .scale(99000)
                    .center([0, 41.83])
                    .rotate([87.65, 0])
                    .parallels([40, 45])
                    .translate([map_width / 1.5, map_height / 2]);

  var geoGenerator = d3.geoPath(projection);

  var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  var svg_map = d3.select(".map")
        .append("svg")
        .style('position', isNeighborhoods ? 'absolute' : 'relative')
        .attr("width", map_width)
        .attr("height", map_height);

    svg_map.selectAll('path')
        .data(routes.features)
        .enter()
        .append('path')
        .attr("class","route_class")
        .attr("d", geoGenerator)
        .attr("id", function(d) { return "bus" + d.properties.ROUTE;})
        .attr('stroke', 'grey')
        .attr('fill', isNeighborhoods ? 'silver' : "white")
        .attr('fill-opacity', isNeighborhoods ? 0.6 : 0)
        .attr('stroke-opacity', isNeighborhoods ? 0 : 1)
        .on("mouseover", function(d) {
            tooltip.transition()
            .duration(200)
            .style("opacity", 20);
            tooltip.html(d.properties.ROUTE + ": " + d.properties.Name)
            .style("left", (d3.event.pageX ) + "px")
            .style("top", (d3.event.pageY + 60) + "px");
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
};


function highlight_line_chart_route(route){
    d3.selectAll(".lines").classed("highlight", false);
    d3.select("#line" + route).classed("highlight", true);
};





function find_domain (data, key){
  //https://stackoverflow.com/questions/8864430/compare-javascript-array-of-objects-to-get-min-max
  var min_value = Infinity;
  var max_value = -Infinity;
  var tmp;

  for (var i=0; i<data.length; i++) {
      tmp = data[i].demand;
      var ponka;
      for (var j = 0; j < tmp.length; j++){
        ponka = tmp[j][key];
        if (ponka < min_value) {min_value = ponka;}
        if (ponka > max_value) {max_value = ponka;}
      }
  }
  return [min_value, max_value]
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

   x.domain(find_domain (data, "days"));
   y.domain(find_domain (data, "riders"));

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

     d3.select("#linechart_g")
      .selectAll(".lines")
      .data(data, function(d) {return d.route})
      .enter()
      .append("path")
      .attr("class","lines")
      .attr("d", function(d) { return line(d.demand)})
      .attr("fill", "none")
      .attr("stroke", "grey")
      .attr("id", function(d) { return ( "line" + d.route )});


};
//
//
// /*
//
//
//
//
// // Handler for dropdown value change
// var dropdownChange = function() {
//     var newCereal = d3.select(this).property('value'),
//         newData   = cerealMap[newCereal];
//
//     updateBars(newData);
// };
//
//
// function drop_down(bus_list){
//   var sorted_bus_list = Object.keys(bus_list).sort();
//
//   var dropdown = d3.select("#vis-container")
//                     .insert("select", "svg")
//                     .on("change", dropdownChange);
//
//
//
// */
