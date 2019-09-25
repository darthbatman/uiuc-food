/* GLOBALS */

/**
 * A map coordinate
 * @typedef {Object} Coordinate
 * @property {number} lat - The latitude
 * @property {number} lng - The longitude
 */

/**
 * An eatery location
 * @typedef {Object} EateryLocation
 * @property {string} name - The name
 * @property {string} cuisine - The cuisine
 * @property {string} address - The address
 * @property {string} area - The location area
 * @property {Coordinate} coordinate - The coordinate
 * @property {string} phoneNumber - The phone number
 * @property {number} price - The price
 * @property {number} rating - The rating out of 5
 * @property {number} reviews - The number of reviews
 * @property {string} website - The website
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
      lat: 40.107544,
      lng: -88.22724,
    },
  },
  {
    name: 'Engineering Quad',
    coordinate: {
      lat: 40.1119845,
      lng: -88.2277056,
    },
  },
  {
    name: 'South Quad',
    coordinate: {
      lat: 40.1035088,
      lng: -88.2295807,
    },
  },
  {
    name: 'Illini Union',
    coordinate: {
      lat: 40.1092142,
      lng: -88.2294112,
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
 * A range
 *
 * @typedef {Object} Range
 * @property {number} lower - The lower bound
 * @property {number} upper - The upper bound
 * @property {number} maxUpper - The maximum upper bound
 */

/**
 * Chart bounds
 *
 * @typedef {Object} Bounds
 * @property {Range} x - x bounds
 * @property {Range} y - y bounds
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
 */

/**
 * Chart options
 * @typedef {Object} ChartOptions
 * @property {Dimensions} The dimensions
 * @property {Bounds} The bounds
 * @property {string} dataFile - The name of the data file
 * @property {Landmark} landmark - The landmark
 * @property {ColorRange} colorRange - The color range
 * @property {string} area - The area
 */
const chartOptions = {
  dimensions: {
    width: 1000,
    height: 800,
    padding: 60,
  },
  bounds: {
    x: {
      lower: 2.5,
      upper: 5.0,
      maxUpper: 5.0,
      step: 0.5,
    },
    y: {
      lower: 0.0,
      upper: 35.0,
      maxUpper: 35.0,
      step: 0.25,
    },
  },
  dataFile: './res/dataset_v2.json',
  landmark: landmarks[0],
  colorRange: {
    start: { r: 255, g: 65, b: 66 },
    end: { r: 244, g: 223, b: 66 },
  },
  area: 'Campustown',
  cuisine: 'All',
};

/* HELPER METHODS */

/**
 * Creates an array with step size.
 *
 * @param {number} start - A starting number
 * @param {number} end - An ending number
 * @param {number} step - The step size
 * @return {number[]} The array
*/
function stepArray(start, end, step) {
  console.log(start);
  console.log(end);
  console.log(step);
  const arr = [];
  let curr = start;
  arr.push(start);
  while (curr < end) {
    curr += step;
    arr.push(curr);
  }
  return arr;
}

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
  const r = Math.round(start.r + (end.r - start.r) * (val / (max - min)));
  const g = Math.round(start.g + (end.g - start.g) * (val / (max - min)));
  const b = Math.round(start.b + (end.b - start.b) * (val / (max - min)));
  return `rgb(${r}, ${g}, ${b})`;
}

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
  const dLat = radians(c2.lat - c1.lat);
  const dLong = radians(c2.lng - c1.lng);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(radians(c1.lat)) * Math.cos(radians(c2.lat))
    * Math.sin(dLong / 2) * Math.sin(dLong / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthMeanRadius * c;
}

/* IMPLEMENTATION METHODS */

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
 * @param {EateryLocation} eateryLocation - The eatery location
 * @param {ChartOptions} options - The chart options
 * @return {number} The x position
 */
function xPosition(eateryLocation, options) {
  const min = options.dimensions.padding;
  const max = options.dimensions.width - options.dimensions.padding;
  const xb = options.bounds.x;
  return (((eateryLocation.rating - xb.lower) / (xb.upper - xb.lower)) * (max - min) + min);
}

/**
 * Calculates the y position of the eatery on the chart.
 *
 * @param {EateryLocation} eateryLocation - The eatery location
 * @param {ChartOptions} options - The chart options
 * @return {number} The x position
 */
function yPosition(eateryLocation, options) {
  const min = options.dimensions.padding;
  const max = options.dimensions.height - options.dimensions.padding;
  const dist = distanceFromLandmark(eateryLocation.coordinate, options.landmark);
  const yb = options.bounds.y;
  return (((dist) / yb.upper) * (max - min) + min);
}

/**
 * Gets the color of the eatery location on the chart.
 *
 * @param {EateryLocation} eateryLocation - The eatery location
 * @param {ChartOptions} options - The chart options
 * @return {string} The color as an rgb string
 */
function color(eateryLocation, options) {
  const distFromOrigin = Math.sqrt((xPosition(eateryLocation, options) ** 2)
    + ((chartOptions.dimensions.height - yPosition(eateryLocation, options)) ** 2));
  const distUpperBound = 1000;
  const cr = options.colorRange;
  return gradientColor(cr.start, cr.end, distFromOrigin, 0, distUpperBound);
}

/**
 * Gets the populated tooltip of the eatery location on the chart.
 *
 * @param {EateryLocation} eateryLocation - The eatery location
 * @param {ChartOptions} options - The chart options
 * @return {string} The populated tooltip as HTML
 */
function tooltip(eateryLocation, options) {
  const dist = distanceFromLandmark(eateryLocation.coordinate, options.landmark);
  const formattedDist = Number.parseFloat(dist).toPrecision(2);
  return `<div class="tooltip">
            <div class='tooltip-title'>${eateryLocation.name}</div>
            <div class="tooltip-content">
              <div class="tooltip-row">
              <span class="tooltip-data-name">Price</span><br>
                <span class="tooltip-data-value">$${eateryLocation.price}</span>
              </div>
              <div class="tooltip-row">
                <span class="tooltip-data-name">Distance from ${options.landmark.name}</span><br>
                <span class="tooltip-data-value">${formattedDist} mi</span>
              </div>
              <div class="tooltip-row">
                <div class="rating">
                  <span class="tooltip-data-name">Rating</span><br>
                  <span class="tooltip-data-value">${eateryLocation.rating}/5</span>
                </div>
                <div class="reviews">
                  <span class="tooltip-data-name">Reviews</span><br>
                  <span class="tooltip-data-value">${eateryLocation.reviews}</span>
                </div>
              </div>
            </div>
          </div>`;
}

/**
 * Draws the legend circle.
 *
 * @param {D3Selection} legend - The legend
 * @param {number} numCircles - The number of circles
 * @param {boolean} varySize - Is the size legend
 * @param {ChartOptions} options - The chart options
 */
function drawLegendCircles(legend, numCircles, varySize, options) {
  const xTranslations = [10, 13, 16.5, 20.5, 25];
  let i;
  for (i = 0; i < numCircles; i += 1) {
    if (varySize) {
      legend.append('g')
        .attr('transform', `translate(${xTranslations[i]}, 10)`)
        .append('circle')
        .attr('r', `${0.5 + 0.25 * i}`)
        .attr('fill', gradientColor(options.colorRange.start, options.colorRange.end, 0.5, 0, 1))
        .attr('class', 'circle');
    } else {
      legend.append('g')
        .attr('transform', `translate(${10 + 3.5 * i}, 10)`)
        .append('circle')
        .attr('r', '1.0')
        .attr('fill', gradientColor(options.colorRange.start, options.colorRange.end, 0 + 0.25 * i, 0, 1))
        .attr('class', 'circle');
    }
  }
}

/**
 * Draws the legends.
 *
 * @param {D3Selection} sizeLegend - The circle size legend
 * @param {D3Selection} colorLegend - The circle color legend
 * @param {ChartOptions} options - The chart options
 */
function drawLegends(sizeLegend, colorLegend, options) {
  drawLegendCircles(sizeLegend, 5, true, options);
  drawLegendCircles(colorLegend, 5, false, options);
}

/**
 * Draws the chart.
 *
 * @param {ChartOptions} options - The chart options
 */
function drawChart(options, svg, sizeLegend, colorLegend) {
  d3.selectAll('g').remove();
  d3.selectAll('text').remove();

  const { width } = options.dimensions;
  const { height } = options.dimensions;
  const { padding } = options.dimensions;

  const xb = options.bounds.x;
  let yb = options.bounds.y;

  d3.json(options.dataFile)
    .then((eateryLocations) => {
      console.log(options.area);
      if (options.area !== 'All') {
        eateryLocations = eateryLocations.filter(a => a.area === options.area);
        console.log(eateryLocations.length);
      }
      if (options.cuisine !== 'All') {
        eateryLocations = eateryLocations.filter(a => a.cuisine === options.cuisine);
        console.log(eateryLocations.length);
      }
      const maxY = d3.max(eateryLocations, eateryLocation => distanceFromLandmark(eateryLocation.coordinate, options.landmark));
      console.log(maxY);
      options.bounds.y.upper = Math.min(yb.maxUpper, maxY);
      yb = options.bounds.y;

      let step = yb.step;
      if (yb.upper - yb.lower > 10) {
        step = 1.0;
      }

      const xTickValues = stepArray(xb.lower, xb.upper, xb.step);
      const yTickValues = stepArray(yb.lower, yb.upper, step);
      
      const x = d3.scaleLinear().domain([xb.lower, xb.upper]).range([padding, width - padding]);
      const y = d3.scaleLinear().domain([yTickValues[yTickValues.length - 1], yb.lower]).range([height - padding, padding]);

      
 
      const xAxis = d3.axisBottom(x).tickValues(xTickValues);
      const yAxis = d3.axisLeft(y).tickValues(yTickValues).tickFormat(d3.format('.2f'));

      const xGridlines = d3.axisBottom(x)
        .tickValues(xTickValues)
        .tickFormat('')
        .tickSize(-height + padding + padding);

      const yGridlines = d3.axisLeft(y)
        .tickValues(yTickValues)
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
      // sort to ensure eateries with smaller radius are drawn later
      eateryLocations.sort((a, b) => d3.descending(a.reviews, b.reviews));
      const minRadius = 2;
      const maxRadius = 10;

      const chartTitle = `Distance from ${options.landmark.name} vs. Rating`;
      const chartXLabel = 'Rating (out of 5)';
      const chartYLabel = `Distance from ${options.landmark.name} (mi)`;

      const counterAxisLabelOffset = 20;

      const radius = d3.scaleLinear()
        .domain([0, d3.max(eateryLocations, eateryLocation => (eateryLocation.reviews > -1 ? eateryLocation.reviews : 20))])
        .range([minRadius, maxRadius]);

      svg.append('text')
        .attr('class', 'label')
        .attr('class', 'large-text')
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
        .html(eateryLocation => tooltip(eateryLocation, options));
      svg.call(tip);

      svg.selectAll('eatery')
        .data(eateryLocations)
        .enter()
        .append('g')
        .attr('transform', eateryLocation => `translate(${xPosition(eateryLocation, options)}, ${yPosition(eateryLocation, options)})`)
        .append('circle')
        .attr('r', eateryLocation => radius(eateryLocation.reviews > -1 ? 2 * eateryLocation.reviews + 100 : 20))
        .attr('fill', eateryLocation => color(eateryLocation, options))
        .attr('class', 'circle')
        .on('mouseover', (eateryLocation) => {
          tip.direction('e');
          tip.show(eateryLocation);
        })
        .on('mouseout', (eateryLocation, i) => {
          tip.hide(eateryLocation, i);
        });
    });

  drawLegends(sizeLegend, colorLegend, options);
}

/**
 * Initializes the chart.
 *
 * @param {ChartOptions} options - The chart options
 */
function initializeChart(options) {
  const svg = d3.select('.chart')
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', `0 0 ${options.dimensions.width} ${options.dimensions.height}`);

  const sizeLegend = d3.select('.legend-one')
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '9.5 8.5 17 3');

  const colorLegend = d3.select('.legend-two')
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '8 8.5 17 3');
  const landmarkSelector = new Selectr('.landmark-selector', {
    searchable: false,
    width: 300,
  });
  const areaSelector = new Selectr('.area-selector', {
    searchable: false,
    width: 300,
  });
  const cuisineSelector = new Selectr('.cuisine-selector', {
    searchable: true,
    width: 300,
  });
  landmarkSelector.el.addEventListener('change', () => {
    let i;
    for (i = 0; i < landmarks.length; i += 1) {
      if (landmarkSelector.getValue() === landmarks[i].name) {
        chartOptions.landmark = landmarks[i];
        drawChart(chartOptions, svg, sizeLegend, colorLegend);
        break;
      }
    }
  });
  areaSelector.el.addEventListener('change', () => {
    chartOptions.area = areaSelector.getValue();
    drawChart(chartOptions, svg, sizeLegend, colorLegend);
  });
  cuisineSelector.el.addEventListener('change', () => {
    chartOptions.cuisine = cuisineSelector.getValue();
    drawChart(chartOptions, svg, sizeLegend, colorLegend);
  });
  drawChart(options, svg, sizeLegend, colorLegend);
}

initializeChart(chartOptions);
