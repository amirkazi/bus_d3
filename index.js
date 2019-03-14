/* global d3 */
var routes;

/* Inspired from book: Interactive Data Viz */
d3.json("CTA_BusRoutes.geojson", function(error, data) {
  if (error) {
    console.log(error);
    console.log('just got an error!')
  } else {
    console.log(data);
    routes = data;
    make_map(routes);
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





/*

function make_scatterplot(data) {
  var margin = {top: 20, right: 30, bottom: 30, left: 40},
      width = 430 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var projection = d3.geoMercator()
    .scale(1100)
    // Center the Map in Chicago
    .center([87.6298, 41.8781])
    .translate([width / 2, height / 2]);

    var path = d3.geoPath()
  .projection(projection);

    // Set svg width & height
    var svg = d3.select('svg')
      .attr('width', width)
      .attr('height', height);

    // Add background
    svg.append('rect')
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height)
      .on('click', clicked);

  d3.json("CTA_BusRoutes.geojson", function(error, routes) {
          g1.selectAll("path")
            .data(topojson.object(routes, routes.objects.states).geometries)
            .enter().append("path")
            .attr("d", d3.geoPath().projection(projection))
            .attr("fill", "transparent")
            .style("stroke", "#333")
            .style("stroke-width", ".2px")
            .attr("class", "muns");
          });




}
*/
