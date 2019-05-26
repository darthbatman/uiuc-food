const LandmarkCoordinate = {
  MainQuad: {
    latitude: 40.107544,
    longitude: -88.22724,
  },
  EngineeringQuad: {
    latitude: 40.1119845,
    longitude: -88.2277056,
  },
  SouthQuad: {
    latitude: 40.1035088,
    longitude: -88.2295807,
  },
  IlliniUnion: {
    latitude: 40.1092142,
    longitude: -88.2294112,
  },
};

const width = 1000;
const height = 800;
const padding = 60;
const dataFile = '../res/dataset.json';

const lowerBoundX = 2.4;
const upperBoundX = 5.0;
const lowerBoundY = 0.0;
const upperBoundY = 1.75;

const svg = d3.select('#chart')
  .append('svg')
  .attr('preserveAspectRatio', 'xMinYMin meet')
  .attr('viewBox', `0 0 ${width} ${height}`);

/* HELPER METHODS */

/**
 * Converts a degree value to radians.
 *
 * @param {number} degrees - The degree value
 * @return {number} The radian value
 */
function radians(degrees) {
  const piDegrees = 180;
  return degrees * Math.PI / piDegrees;
}

/**
 * Gets color on gradient based on value.
 *
 * @param {object} start - The color the gradient starts at
 * @param {object} end - The color the gradient end at
 * @param {number} val - The value
 * @param {number} min - The min bound for val
 * @param {number} max - The max bound for val
*/
function gradientColor(start, end, val, min, max) {
  if (val >= max) return `rgb(${end.r}, ${end.g}, ${end.b})`;
  const r = start.r + (end.r - start.r) * (val / (max - min));
  const g = start.g + (end.g - start.g) * (val / (max - min));
  const b = start.b + (end.b - start.b) * (val / (max - min));
  return `rgb(${r}, ${g}, ${b})`;
}

/* IMPLEMENTATION METHODS */

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
 * Calculates distance in miles (mi) between a coordinate and a given landmark.
 *
 * @param {object} c - The coordinate
 * @param {object} landmarkCoordinate - The coordinate of the landmark
 * @return {number} The distance in miles between c and the landmark
 */
function distanceFromLandmark(c, landmarkCoordinate) {
  const milesPerMeter = 0.000621371;
  return distanceBetween(c, landmarkCoordinate) * milesPerMeter;
}

/**
 * Calculates the x position of the eatery on the chart.
 *
 * @param {object} eatery - The eatery
 * @return {number} The x position
 */
function xPosition(eatery) {
  const min = padding;
  const max = width - padding;
  return (((eatery.rating - lowerBoundX) / (upperBoundX - lowerBoundX)) * (max - min) + min);
}

/**
 * Calculates the y position of the eatery on the chart.
 *
 * @param {object} eatery - The eatery
 * @return {number} The x position
 */
function yPosition(eatery) {
  const min = padding;
  const max = height - padding;
  const dist = distanceFromLandmark(eatery.locations[0].coordinate, LandmarkCoordinate.MainQuad);
  return (((upperBoundY - dist) / upperBoundY) * (max - min) + min);
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
  const distUpperBound = 900;
  const minColor = { r: 244, g: 244, b: 66 };
  const maxColor = { r: 255, g: 75, b: 66 };
  return gradientColor(minColor, maxColor, distFromOrigin, 0, distUpperBound);
}

/**
 * Gets the populated tooltip of the eatery on the chart.
 *
 * @param {object} eatery - The eatery
 * @return {string} The populated tooltip as HTML
 */
function tooltip(eatery) {
  const dist = distanceFromLandmark(eatery.locations[0].coordinate, LandmarkCoordinate.MainQuad);
  const formattedDist = Number.parseFloat(dist).toPrecision(2);
  return `<div class="tooltip">
            <div class='tooltip-title'>${eatery.name}</div>
            <div class="tooltip-content">
              <div class="tooltip-row">
              <span class="tooltip-data-name">Price</span><br>
                <span class="tooltip-data-value">$${eatery.price}</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-data-name">Distance from Main Quad</span><br>
                <span class="tooltip-data-value">${formattedDist} mi</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-data-name">Rating</span><br>
                <span class="tooltip-data-value">${eatery.rating}/5</span>
              </div>
            </div>
          </div>`;
}

const x = d3.scaleLinear().domain([lowerBoundX, upperBoundX]).range([padding, width - padding]);
const y = d3.scaleLinear().domain([lowerBoundY, upperBoundY]).range([height - padding, padding]);

const xAxis = d3.axisBottom(x).tickValues([2.5, 3.0, 3.5, 4.0, 4.5, 5]);
const yAxis = d3.axisLeft(y).tickValues([0.0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75]).tickFormat(d3.format('.2f'));

const xGridlines = d3.axisBottom(x)
  .tickValues([2.5, 3.0, 3.5, 4.0, 4.5, 5])
  .tickFormat('')
  .tickSize(-height + padding + padding);

const yGridlines = d3.axisLeft(y)
  .tickValues([0.0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75])
  .tickFormat('')
  .tickSize(-width + padding + padding);

svg.append('g')
  .attr('class', 'grid')
  .attr('transform', `translate(0, ${(height - padding)})`)
  .call(xGridlines);

svg.append('g')
  .attr('class', 'grid')
  .attr('transform', `translate(${padding}, 0)`)
  .call(yGridlines);

svg.append('g')
  .attr('class', 'axis')
  .attr('transform', `translate(0, ${(height - padding)})`)
  .call(xAxis);

svg.append('g')
  .attr('class', 'axis')
  .attr('transform', `translate(${padding}, 0)`)
  .call(yAxis);

d3.json(dataFile)
  .then((eateries) => {
    // sort to ensure eateries with smaller radius are drawn later
    eateries.sort((a, b) => d3.ascending(a.price, b.price));
    const minRadius = 2;
    const maxRadius = 10;

    const chartTitle = 'Distance from Main Quad vs. Rating';
    const chartXLabel = 'Rating (out of 5)';
    const chartYLabel = 'Distance from Main Quad (mi)';

    const counterAxisLabelOffset = 20;

    const priceMultiplier = 700;
    const priceOffset = 20;

    const radius = d3.scaleLinear()
      .domain([0, d3.max(eateries, eatery => eatery.price)])
      .range([minRadius, maxRadius]);

    svg.append('text')
      .attr('class', 'label')
      .attr('id', 'title')
      .style('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', counterAxisLabelOffset)
      .text(chartTitle);

    svg.append('text')
      .attr('class', 'label')
      .style('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height - counterAxisLabelOffset)
      .text(chartXLabel);

    svg.append('text')
      .attr('class', 'label')
      .style('text-anchor', 'middle')
      .attr('x', -1 * (height / 2))
      .attr('y', counterAxisLabelOffset)
      .attr('transform', 'rotate(-90)')
      .text(chartYLabel);

    const tip = d3.tip()
      .attr('class', 'd3-tip')
      .html(eatery => tooltip(eatery));
    svg.call(tip);

    svg.selectAll('eatery')
      .data(eateries)
      .enter()
      .append('g')
      .attr('transform', eatery => `translate(${xPosition(eatery)}, ${yPosition(eatery)})`)
      .append('circle')
      .attr('r', eatery => (eatery.price !== 0 ? radius(priceMultiplier / (eatery.price) + priceOffset) : 0))
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
