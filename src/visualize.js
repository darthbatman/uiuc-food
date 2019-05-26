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

const lowerBoundX = 2.4;
const upperBoundX = 5.0;
const lowerBoundY = 0.0;
const upperBoundY = 1.5;

const mainQuadCoordinate = {
  latitude: 40.107544,
  longitude: -88.22724,
};

const svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const x = d3.scaleLinear().domain([lowerBoundX, upperBoundX]).range([padding, width - padding]);
const y = d3.scaleLinear().domain([lowerBoundY, upperBoundY]).range([height - padding, padding]);

const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);

/**
 * Converts a degree value to radians.
 *
 * @param {number} degrees - The degree value
 * @return {number} The radian value
 */
function radians(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Calculates distance in meters (m) between two map coordinates.
 * Adapted from: https://stackoverflow.com/questions/1502590/calculate-distance-between-two-points-in-google-maps-v3
 *
 * @param {object} c1 - The first map coordinate
 * @param {object} c2 - The second map coordinate
 * @return {number} The distance in meters between c1 and c2
 */
function distanceBetween(c1, c2) {
  const earthMeanRadius = 6378137;
  const dLat = radians(c2.latitude - c1.latitude);
  const dLong = radians(c2.longitude - c1.longitude);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(radians(c1.latitude)) * Math.cos(radians(c2.latitude))
    * Math.sin(dLong / 2) * Math.sin(dLong / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthMeanRadius * c;
}

/**
 * Calculates distance in miles (mi) between a coordinate and UIUC Main Quad.
 *
 * @param {object} c - The coordinate
 * @return {number} The distance in miles between c and UIUC Main Quad
 */
function distanceFromMainQuad(c) {
  const milesPerMeter = 0.000621371;
  return distanceBetween(c, mainQuadCoordinate) * milesPerMeter;
}

/**
 * Calculates the x position of the eatery on the chart.
 *
 * @param {object} eatery - The eatery
 * @return {number} The x position
 */
function xPosition(eatery) {
  return (((eatery.rating - 2.4) / 2.6) * width + padding);
}

/**
 * Calculates the y position of the eatery on the chart.
 *
 * @param {object} eatery - The eatery
 * @return {number} The x position
 */
function yPosition(eatery) {
  return (((1.5 - distanceFromMainQuad(eatery.locations[0].coordinate)) / 1.5) * height - padding);
}

/**
 * Gets the color of the eatery on the chart.
 *
 * @param {object} eatery - The eatery
 * @return {string} The color as an rgb string
 */
function color(eatery) {
  const distFromOrigin = Math.sqrt((xPosition(eatery) ** 2)
    + ((height - yPosition(eatery)) ** 2));
  if (distFromOrigin >= 900) return 'rgb(255, 75, 66)';
  const r = 244 + (255 - 244) * (distFromOrigin / 900);
  const g = 152 - (152 - 75) * (distFromOrigin / 900);
  const b = 66;
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Gets the populated tooltip of the eatery on the chart.
 *
 * @param {object} eatery - The eatery
 * @return {string} The populated tooltip as HTML
 */
function tooltip(eatery) {
  return `<div style="text-align: center;">${eatery.name}</div>
          <div class="row" style="text-align: center; margin-top: 5px; padding-top: 5px; margin-bottom: 5px; padding-bottom: 5px; border-top: dotted 1px black; border-bottom: dotted 1px black;">
            <div class="col-xs-6">
            <span style="font-size: 14px;">Price</span><br>
              <span style="font-size: 28px;">$${eatery.price}</span>
            </div>
            <div class="col-xs-6">
              <span style="font-size: 14px;">Distance from Main Quad</span><br>
              <span style="font-size: 28px;">${Number.parseFloat(distanceFromMainQuad(eatery.locations[0].coordinate)).toPrecision(2)} mi</span>
            </div>
            <div class="col-xs-6">
              <span style="font-size: 14px;">Rating</span><br>
              <span style="font-size: 28px;">${eatery.rating}/5</span>
            </div>
          </div>`;
}

svg.append('g')
  .attr('class', 'axis')
  .attr('transform', `translate(0, ${(width - padding)})`)
  .call(xAxis);

svg.append('g')
  .attr('class', 'axis')
  .attr('transform', `translate(${padding}, 0)`)
  .call(yAxis);

d3.json(dataFile)
  .then((data) => {
    const r = d3.scaleLinear()
      .domain([0, d3.max(data, eatery => eatery.price)])
      .range([0, 8]);

    svg.append('text')
      .attr('class', 'label')
      .attr('id', 'title')
      .attr('text-anchor', 'end')
      .attr('dx', 440)
      .attr('y', 40)
      .text('UIUC Food');

    svg.append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'end')
      .attr('dx', 400)
      .attr('y', height - 4)
      .text('Rating');

    svg.append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'end')
      .attr('dx', -300)
      .attr('dy', 12)
      .attr('transform', 'rotate(-90)')
      .text('Distance from Main Quad (mi)');

    const tip = d3.tip()
      .attr('class', 'd3-tip')
      .html(eatery => tooltip(eatery));
    svg.call(tip);

    svg.selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', eatery => `translate(${xPosition(eatery)},${yPosition(eatery)})`)
      .append('circle')
      .attr('r', eatery => (eatery.price !== 0 ? r(1000 / eatery.price) : 0))
      .attr('fill', eatery => color(eatery))
      .attr('class', 'circle')
      .on('mouseover', (eatery) => {
        tip.direction('e');
        tip.show(eatery);
      })
      .on('mouseout', (eatery, i) => {
        tip.hide(eatery, i);
      });
  });
