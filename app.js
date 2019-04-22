var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var deasync = require("deasync");
var createCsvWriter = require('csv-writer').createObjectCsvWriter;

var getCoordinateForAddress = deasync(function(address, cb) {
	request.post({
	  headers: {'content-type' : 'application/x-www-form-urlencoded'},
	  url:     'https://www.mapdevelopers.com/data.php?operation=geocode',
	  body:    "address=" + address + " Illinois" // TODO: append Champaign, Illinois or Urbana, Illinois or Savoy, Illinois (basically specify central Illinois)
	}, function(error, response, body){
		body = JSON.parse(body);
		if (body.data.length == 0) {
			cb(undefined, { message: 'Could not find coordinate.' });
		} else {
			cb(undefined, { latitude: body.data.lat, longitude: body.data.lng });
		}
	});
});

// TODO: make call to get eateries.html (Reference Postman)
function getAllEateries(cb) {
	var $ = cheerio.load(fs.readFileSync('data/eateries.html'));
	var eateryRecords = $('.event-detail-box');

	var eateries = [];

	for (var i = 0; i < eateryRecords.length; i++) {
		console.log(i);
		var eateryRecord = eateryRecords[i];
		var eateryName = eateryRecord.children[1].children[1].children[0].data.trim();
		var eateryLocation = {
			address: eateryRecord.children[2].data.trim(),
			coordinate: {}
		};
		eateryLocation.coordinate = getCoordinateForAddress(eateryLocation.address);
		if (eateryLocation.coordinate.message) {
			eateryLocation.coordinate = {};
		}
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
// 	fs.writeFileSync('data/eateries.json', JSON.stringify(eateries, null, 4));
// 	getAllFastFoodEateryNames(eateries, function(fastFoodEateryNames) {
// 		var filteredEateries = eateries.filter((eatery) => !fastFoodEateryNames.includes(eatery.name));
// 		fs.writeFileSync('data/filteredEateries.json', JSON.stringify(filteredEateries, null, 4));
// 	});
// });

// let filteredEateries = JSON.parse(fs.readFileSync('data/filteredEateries.json'));
// for (var i = 0; i < filteredEateries.length; i++) {
// 	if (filteredEateries[i].locations[0].coordinate.latitude == undefined) {
// 		filteredEateries[i].locations[0].coordinate = getCoordinateForAddress(filteredEateries[i].locations[0].address);
// 	}
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
// 	if (filteredEateries[i].locations[0].coordinate.latitude != undefined) {
// 		csvRecords.push({ 
// 			name: filteredEateries[i].name,
// 			latitude: filteredEateries[i].locations[0].coordinate.latitude,
// 			longitude: filteredEateries[i].locations[0].coordinate.longitude
// 		})
// 	}
// }
 
// csvWriter.writeRecords(csvRecords);
