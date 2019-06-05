const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvToJSON = require('csvtojson');
const classifyPoint = require('robust-point-in-polygon');
const { DOMParser } = require('xmldom');
const geoJSON = require('togeojson');

const geocoder = require('./geocoder.js');
const format = require('./format.js');
const zomatoEateryInfo = require('./zomatoEateryInfo.js');
const googleEateryInfo = require('./googleEateryInfo.js');

const URL_CHAMPAIGN_URBANA_EATERIES = 'https://www.visitchampaigncounty.org/business/getlistingsrecords';
const FILE_HTML_EATERIES = `${__dirname}/../data/obtained/eateries.html`;
const FILE_CSV_FAST_FOOD = `${__dirname}'/../data/obtained/FastFoodRestaurants.csv`;
const CLASS_EVENT_DETAIL_BOX = '.event-detail-box';

function saveAllEateriesWithInformation() {
  const eateries = JSON.parse(fs.readFileSync(`${__dirname}/../data/generated/filteredEateriesInBounds.json`));
  const eateriesToSave = [];
  let i;
  for (i = 0; i < eateries.length; i += 1) {
    const data = zomatoEateryInfo.getEateryInformation(eateries[i], ['rating', 'price']);
    if (data.message !== undefined) {
      eateries[i].price = undefined;
      eateries[i].rating = undefined;
    } else {
      eateries[i].price = data.price;
      eateries[i].rating = data.rating;
      eateriesToSave.push(eateries[i]);
    }
  }
  fs.writeFileSync(`${__dirname}/../data/generated/filteredEateriesWithInfoInBounds.json`, JSON.stringify(eateriesToSave, null, 4));
}

function saveAllUniqueFastFoodRestaurants() {
  csvToJSON()
    .fromFile(FILE_CSV_FAST_FOOD)
    .then((json) => {
      const fastFoodNames = [...new Set(json.map(item => item.name.toLowerCase()))];
      const fastFoodEateryNames = { fastFoodEateryNames: fastFoodNames };
      fs.writeFileSync(`${__dirname}/../data/generated/fastFoodEateryNames.json`, JSON.stringify(fastFoodEateryNames, null, 4));
    });
}

function eateryIsInExtendedCampus(eatery) {
  const kml = new DOMParser().parseFromString(fs.readFileSync(`${__dirname}/../data/generated/extendedCampus.kml`, 'utf8'));
  const convertedWithStyles = geoJSON.kml(kml, { styles: true });
  const { features } = convertedWithStyles;

  let i;
  for (i = 0; i < eatery.locations.length; i += 1) {
    const point = eatery.locations[i].coordinate;
    let j;
    for (j = 0; j < features.length; j += 1) {
      const polygon = features[j].geometry.coordinates[0];
      if (classifyPoint(polygon, [point.longitude, point.latitude]) !== 1) {
        return true;
      }
    }
  }
  return false;
}

function isFastFood(eatery) {
  const body = fs.readFileSync(`${__dirname}/../data/generated/fastFoodEateryNames.json`);
  return JSON.parse(body).fastFoodEateryNames.includes(eatery.toLowerCase());
}

function getEateries(start, count, cb) {
  let callback = cb;
  let startIdx;
  let numEateries;
  if (typeof start === 'function') {
    callback = start;
    startIdx = 0;
    numEateries = 1000;
  } else if (typeof count === 'function') {
    callback = count;
    numEateries = start;
    startIdx = 0;
  }
  const formData = {
    catid: '54',
    perpage: '1000',
    display: 'grid',
  };
  request.post({
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    url: URL_CHAMPAIGN_URBANA_EATERIES,
    body: format.formatFormData(formData),
  }, (error, response, body) => {
    fs.writeFileSync(FILE_HTML_EATERIES, body);
    const $ = cheerio.load(body);
    const eateryRecords = $(CLASS_EVENT_DETAIL_BOX);

    const eateries = [];

    if (numEateries > eateryRecords.length) {
      numEateries = eateryRecords.length;
    }

    let i;
    for (i = startIdx; i < numEateries; i += 1) {
      const eateryRecord = eateryRecords[i];
      const eateryName = eateryRecord.children[1].children[0].children[0].data.trim();
      const eateryLocation = {
        address: `${eateryRecord.children[2].data.trim()} ${eateryRecord.children[4].data.trim()}`,
        coordinate: {},
      };
      const geocodedResult = geocoder.getCoordinateForAddress(eateryLocation.address);
      [eateryLocation.coordinate, eateryLocation.address] = geocodedResult;
      if (eateryLocation.coordinate.message) {
        eateryLocation.coordinate = {};
      }
      let eateryIndex = -1;
      let j;
      for (j = 0; j < eateries.length; j += 1) {
        if (eateries[j].name === eateryName) {
          eateryIndex = j;
          break;
        }
      }
      if (eateryIndex === -1) {
        eateries.push({
          name: eateryName,
          locations: [eateryLocation],
        });
      } else {
        eateries[j].locations.push(eateryLocation);
      }
    }
    callback(eateries);
  });
}

function saveEateriesInBounds() {
  const body = fs.readFileSync(`${__dirname}/../data/generated/eateries.json`);
  const eateries = JSON.parse(body);
  const eateriesInBounds = [];
  let i;
  for (i = 0; i < eateries.length; i += 1) {
    if (eateryIsInExtendedCampus(eateries[i])) {
      eateriesInBounds.push(eateries[i]);
    }
  }
  fs.writeFileSync(`${__dirname}/../data/generated/eateriesInBounds.json`, JSON.stringify(eateriesInBounds, null, 4));
}

function saveFilteredEateriesInBoundsJSON() {
  const body = fs.readFileSync(`${__dirname}/../data/generated/eateriesInBounds.json`);
  const eateries = JSON.parse(body);
  const fastFoodEateryNames = [];
  let i;
  for (i = 0; i < eateries.length; i += 1) {
    if (isFastFood(eateries[i].name)) {
      fastFoodEateryNames.push(eateries[i].name);
    }
  }
  const filteredEateries = eateries.filter(eatery => !fastFoodEateryNames.includes(eatery.name));
  fs.writeFileSync(`${__dirname}/../data/generated/filteredEateriesInBounds.json`, JSON.stringify(filteredEateries, null, 4));
}

function saveFilteredEateriesInBoundsCSV() {
  const csvWriter = createCsvWriter({
    path: `${__dirname}/../data/generated/filteredEateriesInBounds.csv`,
    header: [
      { id: 'name', title: 'NAME' },
      { id: 'latitude', title: 'LATITUDE' },
      { id: 'longitude', title: 'LONGITUDE' },
    ],
  });
  const csvRecords = [];
  const filteredEateries = JSON.parse(fs.readFileSync(`${__dirname}/../data/generated/filteredEateriesInBounds.json`));
  let i;
  for (i = 0; i < filteredEateries.length; i += 1) {
    if (filteredEateries[i].locations[0].coordinate.latitude !== undefined) {
      csvRecords.push({
        name: filteredEateries[i].name,
        latitude: filteredEateries[i].locations[0].coordinate.latitude,
        longitude: filteredEateries[i].locations[0].coordinate.longitude,
      });
    }
  }
  csvWriter.writeRecords(csvRecords);
}

function saveFilteredEateriesJSON() {
  const body = fs.readFileSync(`${__dirname}/../data/generated/eateries.json`);
  const eateries = JSON.parse(body);
  const fastFoodEateryNames = [];
  let i;
  for (i = 0; i < eateries.length; i += 1) {
    if (isFastFood(eateries[i].name)) {
      fastFoodEateryNames.push(eateries[i].name);
    }
  }
  const filteredEateries = eateries.filter(eatery => !fastFoodEateryNames.includes(eatery.name));
  fs.writeFileSync(`${__dirname}/../data/generated/filteredEateries.json`, JSON.stringify(filteredEateries, null, 4));
}

function saveFilteredEateriesCSV() {
  const csvWriter = createCsvWriter({
    path: `${__dirname}/../data/generated/filteredEateries.csv`,
    header: [
      { id: 'name', title: 'NAME' },
      { id: 'latitude', title: 'LATITUDE' },
      { id: 'longitude', title: 'LONGITUDE' },
    ],
  });

  const csvRecords = [];
  const filteredEateries = JSON.parse(fs.readFileSync(`${__dirname}/../data/generated/filteredEateries.json`));
  let i;
  for (i = 0; i < filteredEateries.length; i += 1) {
    if (filteredEateries[i].locations[0].coordinate.latitude !== undefined) {
      csvRecords.push({
        name: filteredEateries[i].name,
        latitude: filteredEateries[i].locations[0].coordinate.latitude,
        longitude: filteredEateries[i].locations[0].coordinate.longitude,
      });
    }
  }

  csvWriter.writeRecords(csvRecords);
}

function getGoogleReviews() {
  const body = fs.readFileSync(`${__dirname}/../data/generated/dataset.json`);
  const eateries = JSON.parse(body);
  let i;
  for (i = 0; i < eateries.length; i += 1) {
    const res = googleEateryInfo.getEateryInformation(eateries[i]);
    eateries[i].rating = res.rating;
    eateries[i].reviews = res.reviews;
  }
  fs.writeFileSync(`${__dirname}/../data/generated/dataset.json`, JSON.stringify(eateries, null, 4));
}

getGoogleReviews();

module.exports = {
  getEateries,
  isFastFood,
  saveFilteredEateriesJSON,
  saveFilteredEateriesCSV,
  eateryIsInExtendedCampus,
  saveEateriesInBounds,
  saveFilteredEateriesInBoundsJSON,
  saveFilteredEateriesInBoundsCSV,
  saveAllEateriesWithInformation,
  saveAllUniqueFastFoodRestaurants,
};
