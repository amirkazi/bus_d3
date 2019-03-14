/* global d3 */
var routes;
var lollapalooza

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


// Creating Map for Chicago
function make_map(routes){
  var map_width = 600;
  var map_height = 600;

  // with help from:
  // https://gis.stackexchange.com/questions/180675/d3-center-a-map-feature-using-correct-latitude-and-longitude-without-rotation
  var projection = d3.geoAlbers()
                    .scale(79000)
                    .center([0, 41.83])
                    .rotate([87.65, 0])
                    .parallels([40, 45])
                    .translate([map_width / 2, map_height / 2]);

  var geoGenerator = d3.geoPath(projection);

  var svg_map = d3.select(".map")
        .append("svg")
        .attr("width", map_width)
        .attr("height", map_height)
        .selectAll('path')
        .data(routes.features)
        .enter()
        .append('path')
        .attr("d", geoGenerator)
        .attr("id", function(d) { return d.properties.ROUTE;})
        .attr('stroke', 'black')
        .attr('fill', "white")
        .style("stroke-width", "0.25")
        .on("click", function(d) {console.log(d)});
}



function make_line_chart(dataset){
  console.log('in line chart!')

}
