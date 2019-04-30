var fs = require('fs');

var uiucFood = require('../uiuc-food.js');

// var eatery = {
//         "name": "Zorba's",
//         "locations": [
//             {
//                 "address": "627 East Green Street, Champaign, IL 61820, United States of America",
//                 "coordinate": {
//                     "latitude": 40.1102151,
//                     "longitude": -88.22991
//                 }
//             }
//         ]
//     };

// uiucFood.getEateryInformation(eatery, [ 'rating', 'price' ], function(data) {
// 	console.log(data);
// });

uiucFood.saveAllEateriesWithInformation();