const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvToJSON = require('csvtojson');
const classifyPoint = require("robust-point-in-polygon");
const DOMParser = require('xmldom').DOMParser;
const geoJSON = require('togeojson');

const geocoder = require('./lib/geocoder.js');
const format = require('./lib/format.js');
const eateryInfo = require('./lib/eateryInfo.js');

const URL_CHAMPAIGN_URBANA_EATERIES = 'https://www.visitchampaigncounty.org/business/getlistingsrecords';
const HEADER_NAME_CONTENT = 'Content-Type';
const HEADER_VALUE_FORM = 'application/x-www-form-urlencoded';
const FORM_DATA_NAME_CATID = 'catid';
const FORM_DATA_VALUE_CATID = '54';
const FORM_DATA_NAME_PERPAGE = 'perpage';
const FORM_DATA_VALUE_PERPAGE = '1000';
const FORM_DATA_NAME_DISPLAY = 'display';
const FORM_DATA_VALUE_DISPLAY = 'grid';
const FILE_HTML_EATERIES = 'data/obtained/eateries.html';
const FILE_CSV_FAST_FOOD = 'data/obtained/FastFoodRestaurants.csv';
const CLASS_EVENT_DETAIL_BOX = '.event-detail-box';

function saveAllEateriesWithInformation() {
    var eateries = JSON.parse(fs.readFileSync('data/generated/filteredEateriesInBounds.json'));
    var eateriesToSave = [];
    for (var i = 0; i < eateries.length; i++) {
        var data = eateryInfo.getEateryInformation(eateries[i], [ 'rating', 'price' ]);
        if (data.message != undefined) {
            eateries[i].price = undefined;
            eateries[i].rating = undefined;
        } else {
            eateries[i].price = data.price;
            eateries[i].rating = data.rating;
            eateriesToSave.push(eateries[i]);
        }
    }
    fs.writeFileSync('data/generated/filteredEateriesWithInfoInBounds.json', JSON.stringify(eateriesToSave, null, 4));
}

function saveAllUniqueFastFoodRestaurants() {
    csvToJSON()
    .fromFile(FILE_CSV_FAST_FOOD)
    .then((jsonObj)=>{
        var fastFoodNames = [...new Set(jsonObj.map(item => item.name.toLowerCase()))];
        var fastFoodEateryNames = {
            fastFoodEateryNames: fastFoodNames
        };
        fs.writeFileSync('data/generated/fastFoodEateryNames.json', JSON.stringify(fastFoodEateryNames, null, 4));
    })
}

function eateryIsInExtendedCampus(eatery) {
    var kml = new DOMParser().parseFromString(fs.readFileSync('data/generated/extendedCampus.kml', 'utf8'));
    var convertedWithStyles = geoJSON.kml(kml, { styles: true });
    var features = convertedWithStyles.features;

    for (var j = 0; j < eatery.locations.length; j++) {
        var point = eatery.locations[j].coordinate;
        for (var i = 0; i < features.length; i++) {
            var polygon = features[i].geometry.coordinates[0];
            if (classifyPoint(polygon, [point.longitude, point.latitude]) != 1) {
                return true;
            }
        }
    }
    return false;
}

function isFastFood(eatery) {
    var body = fs.readFileSync('data/generated/fastFoodEateryNames.json');
    body = JSON.parse(body);
    return body.fastFoodEateryNames.includes(eatery.toLowerCase());
}

function getEateries(start, count, cb) {
    if (typeof start == 'function') {
        cb = start;
        start = 0;
        count = 1000;
    }
    if (typeof count == 'function') {
        cb = count;
        count = start;
        start = 0;
    }
    var formData = { 
        [FORM_DATA_NAME_CATID]: FORM_DATA_VALUE_CATID,
        [FORM_DATA_NAME_PERPAGE]: FORM_DATA_VALUE_PERPAGE,
        [FORM_DATA_NAME_DISPLAY]: FORM_DATA_VALUE_DISPLAY
    };
    request.post({
        headers: { 
            [HEADER_NAME_CONTENT]: HEADER_VALUE_FORM
        },
        url: URL_CHAMPAIGN_URBANA_EATERIES,
        body: format.formatFormData(formData)
    }, function(error, response, body) {
        fs.writeFileSync(FILE_HTML_EATERIES, body);
        var $ = cheerio.load(body);
        var eateryRecords = $(CLASS_EVENT_DETAIL_BOX);

        var eateries = [];

        if (count > eateryRecords.length) {
            count = eateryRecords.length;
        }

        for (var i = start; i < count; i++) {
            console.log(i);
            var eateryRecord = eateryRecords[i];
            var eateryName = eateryRecord.children[1].children[0].children[0].data.trim();
            var eateryLocation = {
                address: eateryRecord.children[2].data.trim() + ' ' + eateryRecord.children[4].data.trim(),
                coordinate: {}
            };
            var geocodedResult = geocoder.getCoordinateForAddress(eateryLocation.address);
            eateryLocation.coordinate = geocodedResult[0];
            if (eateryLocation.coordinate.message) {
                eateryLocation.coordinate = {};
            }
            eateryLocation.address = geocodedResult[1];
            var eateryIndex = -1;
            for (var j = 0; j < eateries.length; j++) {
                if (eateries[j].name == eateryName) {
                    eateryIndex = j;
                    break;
                }
            }
            if (eateryIndex == -1) {
                eateries.push({
                    name: eateryName,
                    locations: [eateryLocation]
                });
            } else {
                eateries[j].locations.push(eateryLocation);
            }
        }
        cb(eateries);
    });
}

function saveEateriesInBounds() {
    var body = fs.readFileSync('data/generated/eateries.json');
    var eateries = JSON.parse(body);
    var eateriesInBounds = [];
    for (var i = 0; i < eateries.length; i++) {
        if (eateryIsInExtendedCampus(eateries[i])) {
            eateriesInBounds.push(eateries[i]);
        }
    }
    fs.writeFileSync('data/generated/eateriesInBounds.json', JSON.stringify(eateriesInBounds, null, 4));
}

function saveFilteredEateriesInBoundsJSON() {
    var body = fs.readFileSync('data/generated/eateriesInBounds.json');
    var eateries = JSON.parse(body);
    var fastFoodEateryNames = [];
    for (var i = 0; i < eateries.length; i++) {
        if (isFastFood(eateries[i].name)) {
            fastFoodEateryNames.push(eateries[i].name);
        }
    }
    var filteredEateries = eateries.filter((eatery) => !fastFoodEateryNames.includes(eatery.name));
    fs.writeFileSync('data/generated/filteredEateriesInBounds.json', JSON.stringify(filteredEateries, null, 4));
}

function saveFilteredEateriesInBoundsCSV() {
    var csvWriter = createCsvWriter({
        path: 'data/generated/filteredEateriesInBounds.csv',
        header: [
            {id: 'name', title: 'NAME'},
            {id: 'latitude', title: 'LATITUDE'},
            {id: 'longitude', title: 'LONGITUDE'}
        ]
    });

    var csvRecords = [];
    var filteredEateries = JSON.parse(fs.readFileSync('data/generated/filteredEateriesInBounds.json'));
    for (var i = 0; i < filteredEateries.length; i++) {
     if (filteredEateries[i].locations[0].coordinate.latitude != undefined) {
         csvRecords.push({ 
             name: filteredEateries[i].name,
             latitude: filteredEateries[i].locations[0].coordinate.latitude,
             longitude: filteredEateries[i].locations[0].coordinate.longitude
         })
     }
    }
     
    csvWriter.writeRecords(csvRecords);
}

function saveFilteredEateriesJSON() {
    var body = fs.readFileSync('data/generated/eateries.json');
    var eateries = JSON.parse(body);
    var fastFoodEateryNames = [];
    for (var i = 0; i < eateries.length; i++) {
        if (isFastFood(eateries[i].name)) {
            fastFoodEateryNames.push(eateries[i].name);
        }
    }
    var filteredEateries = eateries.filter((eatery) => !fastFoodEateryNames.includes(eatery.name));
    fs.writeFileSync('data/generated/filteredEateries.json', JSON.stringify(filteredEateries, null, 4));
}

function saveFilteredEateriesCSV() {
    var csvWriter = createCsvWriter({
        path: 'data/generated/filteredEateries.csv',
        header: [
            {id: 'name', title: 'NAME'},
            {id: 'latitude', title: 'LATITUDE'},
            {id: 'longitude', title: 'LONGITUDE'}
        ]
    });

    var csvRecords = [];
    var filteredEateries = JSON.parse(fs.readFileSync('data/generated/filteredEateries.json'));
    for (var i = 0; i < filteredEateries.length; i++) {
     if (filteredEateries[i].locations[0].coordinate.latitude != undefined) {
         csvRecords.push({ 
             name: filteredEateries[i].name,
             latitude: filteredEateries[i].locations[0].coordinate.latitude,
             longitude: filteredEateries[i].locations[0].coordinate.longitude
         })
     }
    }
     
    csvWriter.writeRecords(csvRecords);
}

module.exports = {
    getEateries,
    isFastFood,
    saveFilteredEateriesJSON,
    saveFilteredEateriesCSV,
    eateryIsInExtendedCampus,
    saveEateriesInBounds,
    saveFilteredEateriesInBoundsJSON,
    saveFilteredEateriesInBoundsCSV,
    saveAllEateriesWithInformation
};