const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const geocoder = require('./geocoder.js');
const format = require('./format.js');

const URL_CHAMPAIGN_URBANA_EATERIES = 'https://www.visitchampaigncounty.org/business/getlistingsrecords';
const HEADER_NAME_CONTENT = 'Content-Type';
const HEADER_VALUE_FORM = 'application/x-www-form-urlencoded';
const FORM_DATA_NAME_CATID = 'catid';
const FORM_DATA_VALUE_CATID = '54';
const FORM_DATA_NAME_PERPAGE = 'perpage';
const FORM_DATA_VALUE_PERPAGE = '1000';
const FORM_DATA_NAME_DISPLAY = 'display';
const FORM_DATA_VALUE_DISPLAY = 'grid';
const HTML_FILE_EATERIES = 'data/eateries.html';
const CLASS_EVENT_DETAIL_BOX = '.event-detail-box';

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
    }, function(error, response, body){
        fs.writeFileSync(HTML_FILE_EATERIES, body);
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
                address: eateryRecord.children[2].data.trim() + ' Champaign, Illinois',
                coordinate: {}
            };
            console.log(eateryName);
            console.log(eateryLocation);
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

// TODO: figure out fast-food/chain by online searching
function getAllFastFoodEateryNames(eateries, cb) {
    var fastFoodEateryNames = [];
    for (var i = 0; i < eateries.length; i++) {
        if (eateries[i].locations.length > 1) {
            fastFoodEateryNames.push(eateries[i].name);
        }
    }
    // manually remove non-chains
    var nonFastFoodMultipleLocationEateries = ['Lil Porgy\'s BBQ',
        'Rainbow Garden', 'Pekara Bakery & Bistro', 'Niro\'s Gyros',
        'Merry Ann\'s Diner', 'Latte Da!', 'Ko Fusion',
        'Filippo\'s Pizza & Italian Food', 'China King',
        'Black Dog Smoke & Ale House'];
    for (var i = 0; i < nonFastFoodMultipleLocationEateries.length; i++) {
        var index = fastFoodEateryNames.indexOf(nonFastFoodMultipleLocationEateries[i]);
        if (index !== -1) fastFoodEateryNames.splice(index, 1);
    }
    cb(fastFoodEateryNames);
}

// getAllEateries(function(eateries) {
//  fs.writeFileSync('data/eateries.json', JSON.stringify(eateries, null, 4));
//  getAllFastFoodEateryNames(eateries, function(fastFoodEateryNames) {
//      var filteredEateries = eateries.filter((eatery) => !fastFoodEateryNames.includes(eatery.name));
//      fs.writeFileSync('data/filteredEateries.json', JSON.stringify(filteredEateries, null, 4));
//  });
// });

// let filteredEateries = JSON.parse(fs.readFileSync('data/filteredEateries.json'));
// for (var i = 0; i < filteredEateries.length; i++) {
//  if (filteredEateries[i].locations[0].coordinate.latitude == undefined) {
//      filteredEateries[i].locations[0].coordinate = getCoordinateForAddress(filteredEateries[i].locations[0].address);
//  }
// }
// fs.writeFileSync('data/filteredEateries.json', JSON.stringify(filteredEateries, null, 4));

// var csvWriter = createCsvWriter({
//     path: 'data/filteredEateries.csv',
//     header: [
//         {id: 'name', title: 'NAME'},
//         {id: 'latitude', title: 'LATITUDE'},
//         {id: 'longitude', title: 'LONGITUDE'}
//     ]
// });

// var csvRecords = [];
// var filteredEateries = JSON.parse(fs.readFileSync('data/filteredEateries.json'));
// for (var i = 0; i < filteredEateries.length; i++) {
//  if (filteredEateries[i].locations[0].coordinate.latitude != undefined) {
//      csvRecords.push({ 
//          name: filteredEateries[i].name,
//          latitude: filteredEateries[i].locations[0].coordinate.latitude,
//          longitude: filteredEateries[i].locations[0].coordinate.longitude
//      })
//  }
// }
 
// csvWriter.writeRecords(csvRecords);

module.exports = {
    getEateries
};