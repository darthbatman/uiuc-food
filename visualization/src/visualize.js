/* 
*  Reference: http://waf.cs.illinois.edu/discovery/every_gen_ed_at_uiuc_by_gpa/
*  Dataset: ../res/dataset.json
*  Make something similar to above linked GPA visualization.
*  Use D3.js for visualization.
*  Ability to select/change axes.
*  Show RATING vs. PRICE, RATING vs. CUISINE, CUISINE vs. PRICE etc.
*/

const width = 400;
const height = 400;
const padding = 40;
const dataFile = '../res/dataset.json';

var svg = d3.select('#chart')
               .append('svg')
               .attr('width', width)
               .attr('height', height);

var x = d3.scale.linear().domain([0, 50]).range([padding, width - padding]);
var y = d3.scale.linear().domain([5, 0]).range([padding, height - padding]);

var xAxis = d3.svg.axis().scale(x).orient('bottom');
var yAxis = d3.svg.axis().scale(y).orient('left');

svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0, ' + (width - padding) + ')')
    .call(xAxis);
 
svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + padding + ', 0)')
    .call(yAxis);

d3.json(dataFile, function (data) {

var max_r = d3.max(data.map(
                       function (d) { return d.price; })),
        r = d3.scale.linear()
            .domain([0, d3.max(data, function (d) { return d.price; })])
            .range([0, 12]);

 
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cx", function (d) { return d.price * 5; }) // price
        .attr("cy", function (d) { return d.rating * 50 + 40; }) // distance from campus center
        .attr("r", function (d) { return r(d.price); }); // rating
});
