/* 
*  Reference: http://waf.cs.illinois.edu/discovery/every_gen_ed_at_uiuc_by_gpa/
*  Dataset: ../res/dataset.json
*  Make something similar to above linked GPA visualization.
*  Use D3.js for visualization.
*  Ability to select/change axes.
*  Show RATING vs. PRICE, RATING vs. CUISINE, CUISINE vs. PRICE etc.
*/

const width = 800;
const height = 800;
const padding = 80;
const dataFile = '../res/dataset.json';

const mainQuadCoordinate = {
  latitude: 40.107544,
  longitude: -88.227240
};

var svg = d3.select('#chart')
               .append('svg')
               .attr('width', width)
               .attr('height', height);

var x = d3.scale.linear().domain([2.4, 5]).range([padding, width - padding]);
var y = d3.scale.linear().domain([1.5, 0]).range([padding, height - padding]);

var xAxis = d3.svg.axis().scale(x).orient('bottom');
var yAxis = d3.svg.axis().scale(y).orient('left');

var rad = function(x) {
  return x * Math.PI / 180;
};
// Adapted from: https://stackoverflow.com/questions/1502590/calculate-distance-between-two-points-in-google-maps-v3
var getDistance = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.latitude - p1.latitude);
  var dLong = rad(p2.longitude - p1.longitude);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.latitude)) * Math.cos(rad(p2.latitude)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};

var x = function(d) {
  return (((d.rating - 2.4) / 2.6) * width + padding);
}

var y = function(d) {
  return (((1.5 - distanceFromCampusCenter(d.locations[0].coordinate)) / 1.5) * height - padding);
}

function distanceFromCampusCenter(coordinate) {
    return getDistance(coordinate, mainQuadCoordinate) * 0.000621371;
}

svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0, ' + (width - padding) + ')')
    .call(xAxis);
 
svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + padding + ', 0)')
    .call(yAxis);

d3.json(dataFile, function (data) {
    var r = d3.scale.linear()
           .domain([0, d3.max(data, function (d) { return d.price; })])
           .range([0, 8]);

    var elem = svg.selectAll("g")
        .data(data)

    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("dx", 400)
      .attr("y", height - 4)
      .text("Rating");

    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("dx", -300)
      .attr("dy", 12)
      .attr("transform", "rotate(-90)")
      .text("Distance from Main Quad (mi)");

    var elemEnter = elem.enter()
        .append("g")
        .attr("transform", function(d){return "translate(" + x(d) + "," + y(d) + ")"})

    var tip = d3.tip()
           .attr('class', 'd3-tip')
           .html(function(d) {

             return "<div>" + d.name + "</div>" +
                    '<div class="row" style="text-align: center; margin-top: 5px; padding-top: 5px; margin-bottom: 5px; padding-bottom: 5px; border-top: dotted 1px black; border-bottom: dotted 1px black;">' +
                    '<div class="col-xs-6">' +
                    '<span style="font-size: 14px;">' + "Price" + '</span><br>' +
                       '<span style="font-size: 28px;">$' + d.price + '</span>' +
                    '</div>' +
                    '<div class="col-xs-6">' +
                      '<span style="font-size: 14px;">' + "Distance from Main Quad" + '</span><br>' +
                      '<span style="font-size: 28px;">' + Number.parseFloat(distanceFromCampusCenter(d.locations[0].coordinate)).toPrecision(2) + ' mi</span>' +
                    '</div>' +
                    '<div class="col-xs-6">' +
                      '<span style="font-size: 14px;">' + "Rating" + '</span><br>' +
                      '<span style="font-size: 28px;">' + d.rating + '/5</span>' +
                    '</div>' +
                    '</div>'

             return d.name + ": " + d.title + "<br>" +
                    "Avg. GPA: " + 1 + "<br>" +
                    "A and A+ Percentage: " + 1+"%" + "<br>" +
                    "Gened: "+ d.GenedRequirement;
                    /*
             */
           });
           svg.call(tip);

    elemEnter.append("circle")
        .attr("r", function(d){ return d.price != 0 ? r(1000 / d.price) : 0; } )
        .attr("class", "circle")
        .on('mouseover', function(d){
            tip.show(d);
        })
        .on('mouseout', function(d,i){
          tip.hide(d,i);
        });
});
