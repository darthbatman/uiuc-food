/* GLOBALS */

/**
 * A map coordinate
 * @typedef {Object} Coordinate
 * @property {number} latitude - The latitude
 * @property {number} longitude - The longitude
 */

/**
 * A location
 * @typedef {Object} Location
 * @property {string} address - The address
 * @property {Coordinate} coordinate - The coordinate
 */

/**
 * An eatery
 * @typedef {Object} Eatery
 * @property {string} name - The name
 * @property {Location[]} locations - An array of locations
 * @property {number} price - The price
 * @property {number} rating - The rating
 */

/**
 * A geographic landmark
 * @typedef {Object} Landmark
 * @property {string} name - The name
 * @property {Coordinate} coordinate - The coordinate
 */

/**
 * Array of Landmarks.
 */
const landmarks = [
  {
    name: 'Main Quad',
    coordinate: {
      latitude: 40.107544,
      longitude: -88.22724,
    },
  },
  {
    name: 'Engineering Quad',
    coordinate: {
      latitude: 40.1119845,
      longitude: -88.2277056,
    },
  },
  {
    name: 'South Quad',
    coordinate: {
      latitude: 40.1035088,
      longitude: -88.2295807,
    },
  },
  {
    name: 'Illini Union',
    coordinate: {
      latitude: 40.1092142,
      longitude: -88.2294112,
    },
  },
];

/**
 * Chart dimensions
 *
 * @typedef {Object} Dimensions
 * @property {number} width - The width
 * @property {number} height - The height
 * @property {number} padding - The padding
 */

/**
 * A color
 * @typedef {Object} Color
 * @property {number} r - The red component
 * @property {number} g - The green component
 * @property {number} b - The blue component
 */

/**
 * A color range
 * @typedef {Object} ColorRange
 * @property {Color} start - The starting color
 * @property {Color} end - The ending color
 * @property {number} b - The blue component
 */

/**
 * Chart options
 * @typedef {Object} ChartOptions
 * @property {Dimensions} The dimensions
 * @property {string} dataFile - The name of the data file
 * @property {ColorRange} colorRange - The color range
 */

const chartOptions = {
  dimensions: {
    width: 1000,
    height: 800,
    padding: 60,
  },
  dataFile: '../res/dataset.json',
  colorRange: {
    start: { r: 244, g: 244, b: 66 },
    end: { r: 255, g: 75, b: 66 },
  },
};

const lowerBoundX = 2.4;
const upperBoundX = 5.0;
const lowerBoundY = 0.0;
const upperBoundY = 1.75;

const svg = d3.select('#chart')
  .append('svg')
  .attr('preserveAspectRatio', 'xMinYMin meet')
  .attr('viewBox', `0 0 ${chartOptions.dimensions.width} ${chartOptions.dimensions.height}`);

const legendOne = d3.select('#legend-one')
  .append('svg')
  .attr('preserveAspectRatio', 'xMinYMin meet')
  .attr('viewBox', '9.5 8.5 17 3');

const legendTwo = d3.select('#legend-two')
  .append('svg')
  .attr('preserveAspectRatio', 'xMinYMin meet')
  .attr('viewBox', '8 8.5 17 3');

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
 * Gets RGB string for color.
 *
 * @param {Color} c - A color
 * @return {string} The RGB string
*/
function rgbString(c) {
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

/**
 * Gets color on gradient based on value.
 *
 * @param {Color} start - The color the gradient starts at
 * @param {Color} end - The color the gradient end at
 * @param {number} val - The value
 * @param {number} min - The min bound for val
 * @param {number} max - The max bound for val
 * @return {string} The RGB string for the color on gradient
*/
function gradientColor(start, end, val, min, max) {
  if (val >= max) return rgbString(end);
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
 * @param {Coordinate} c1 - The first map coordinate
 * @param {Coordinate} c2 - The second map coordinate
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
 * @param {Coordiante} c - The coordinate
 * @param {Landmark} landmark - The landmark
 * @return {number} The distance in miles between c and the landmark
 */
function distanceFromLandmark(c, landmark) {
  const milesPerMeter = 0.000621371;
  return distanceBetween(c, landmark.coordinate) * milesPerMeter;
}

/**
 * Calculates the x position of the eatery on the chart.
 *
 * @param {Eatery} eatery - The eatery
 * @param {ChartOptions} options - The chart options
 * @return {number} The x position
 */
function xPosition(eatery, options) {
  const min = options.dimensions.padding;
  const max = options.dimensions.width - options.dimensions.padding;
  return (((eatery.rating - lowerBoundX) / (upperBoundX - lowerBoundX)) * (max - min) + min);
}

/**
 * Calculates the y position of the eatery on the chart.
 *
 * @param {Eatery} eatery - The eatery
 * @param {enum} landmark - The landmark
 * @param {ChartOptions} options - The chart options
 * @return {number} The x position
 */
function yPosition(eatery, landmark, options) {
  const min = options.dimensions.padding;
  const max = options.dimensions.height - options.dimensions.padding;
  const dist = distanceFromLandmark(eatery.locations[0].coordinate, landmark);
  return (((upperBoundY - dist) / upperBoundY) * (max - min) + min);
}

/**
 * Gets the color of the eatery on the chart.
 *
 * @param {Eatery} eatery - The eatery
 * @param {Landmark} landmark - The landmark
 * @param {ChartOptions} options - The chart options
 * @return {string} The color as an rgb string
 */
function color(eatery, landmark, options) {
  const distFromOrigin = Math.sqrt((xPosition(eatery, options) ** 2)
    + ((chartOptions.dimensions.height - yPosition(eatery, landmark, options)) ** 2));
  const distUpperBound = 900;
  const cr = options.colorRange;
  return gradientColor(cr.start, cr.end, distFromOrigin, 0, distUpperBound);
}

/**
 * Gets the populated tooltip of the eatery on the chart.
 *
 * @param {Eatery} eatery - The eatery
 * @param {enum} landmark - The landmark
 * @return {string} The populated tooltip as HTML
 */
function tooltip(eatery, landmark) {
  const dist = distanceFromLandmark(eatery.locations[0].coordinate, landmark);
  const formattedDist = Number.parseFloat(dist).toPrecision(2);
  return `<div class="tooltip">
            <div class='tooltip-title'>${eatery.name}</div>
            <div class="tooltip-content">
              <div class="tooltip-row">
              <span class="tooltip-data-name">Price</span><br>
                <span class="tooltip-data-value">$${eatery.price}</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-data-name">Distance from ${landmark.name}</span><br>
                <span class="tooltip-data-value">${formattedDist} mi</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-data-name">Rating</span><br>
                <span class="tooltip-data-value">${eatery.rating}/5</span>
              </div>
            </div>
          </div>`;
}

/**
 * Draws the legend.
 */
function drawLegend() {
  const minColor = { r: 244, g: 244, b: 66 };
  const maxColor = { r: 255, g: 75, b: 66 };
  legendOne.append('g')
    .attr('transform', 'translate(10, 10)')
    .append('circle')
    .attr('r', '0.5')
    .attr('fill', gradientColor(minColor, maxColor, 0.5, 0, 1))
    .attr('class', 'circle');
  legendOne.append('g')
    .attr('transform', 'translate(13, 10)')
    .append('circle')
    .attr('r', '0.75')
    .attr('fill', gradientColor(minColor, maxColor, 0.5, 0, 1))
    .attr('class', 'circle');
  legendOne.append('g')
    .attr('transform', 'translate(16.5, 10)')
    .append('circle')
    .attr('r', '1.0')
    .attr('fill', gradientColor(minColor, maxColor, 0.5, 0, 1))
    .attr('class', 'circle');
  legendOne.append('g')
    .attr('transform', 'translate(20.5, 10)')
    .append('circle')
    .attr('r', '1.25')
    .attr('fill', gradientColor(minColor, maxColor, 0.5, 0, 1))
    .attr('class', 'circle');
  legendOne.append('g')
    .attr('transform', 'translate(25, 10)')
    .append('circle')
    .attr('r', '1.5')
    .attr('fill', gradientColor(minColor, maxColor, 0.5, 0, 1))
    .attr('class', 'circle');

  legendTwo.append('g')
    .attr('transform', 'translate(10, 10)')
    .append('circle')
    .attr('r', '1.0')
    .attr('fill', gradientColor(minColor, maxColor, 0, 0, 1))
    .attr('class', 'circle');
  legendTwo.append('g')
    .attr('transform', 'translate(13.5, 10)')
    .append('circle')
    .attr('r', '1.0')
    .attr('fill', gradientColor(minColor, maxColor, 0.25, 0, 1))
    .attr('class', 'circle');
  legendTwo.append('g')
    .attr('transform', 'translate(17, 10)')
    .append('circle')
    .attr('r', '1.0')
    .attr('fill', gradientColor(minColor, maxColor, 0.5, 0, 1))
    .attr('class', 'circle');
  legendTwo.append('g')
    .attr('transform', 'translate(20.5, 10)')
    .append('circle')
    .attr('r', '1.0')
    .attr('fill', gradientColor(minColor, maxColor, 0.75, 0, 1))
    .attr('class', 'circle');
  legendTwo.append('g')
    .attr('transform', 'translate(24, 10)')
    .append('circle')
    .attr('r', '1.0')
    .attr('fill', gradientColor(minColor, maxColor, 1, 0, 1))
    .attr('class', 'circle');
}

/**
 * Draws the chart.
 *
 * @param {Landmark} landmark - The landmark
 * @param {ChartOptions} options - The chart options
 */
function drawChart(landmark, options) {
  d3.selectAll('g').remove();
  d3.selectAll('text').remove();

  const { width } = options.dimensions;
  const { height } = options.dimensions;
  const { padding } = options.dimensions;

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

  d3.json(options.dataFile)
    .then((eateries) => {
      // sort to ensure eateries with smaller radius are drawn later
      eateries.sort((a, b) => d3.ascending(a.price, b.price));
      const minRadius = 2;
      const maxRadius = 10;

      const chartTitle = `Distance from ${landmark.name} vs. Rating`;
      const chartXLabel = 'Rating (out of 5)';
      const chartYLabel = `Distance from ${landmark.name} (mi)`;

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
        .html(eatery => tooltip(eatery, landmark));
      svg.call(tip);

      svg.selectAll('eatery')
        .data(eateries)
        .enter()
        .append('g')
        .attr('transform', eatery => `translate(${xPosition(eatery, options)}, ${yPosition(eatery, landmark, options)})`)
        .append('circle')
        .attr('r', eatery => (eatery.price !== 0 ? radius(priceMultiplier / (eatery.price) + priceOffset) : 0))
        .attr('fill', eatery => color(eatery, landmark, options))
        .attr('class', 'circle')
        .on('mouseover', (eatery) => {
          tip.direction('e');
          tip.show(eatery);
        })
        .on('mouseout', (eatery, i) => {
          tip.hide(eatery, i);
        });
    });

  drawLegend();
}

drawChart(landmarks[0], chartOptions);

const landmarkSelector = new Selectr('#landmark-selector', {
  searchable: false,
  width: 300,
});

/* EVENT LISTENERS */

landmarkSelector.el.addEventListener('change', () => {
  let i;
  for (i = 0; i < landmarks.length; i += 1) {
    if (landmarkSelector.getValue() === landmarks[i].name) {
      drawChart(landmarks[i], chartOptions);
      break;
    }
  }
});
