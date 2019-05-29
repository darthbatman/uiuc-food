const request = require('request');
const deasync = require("deasync");

var getEateryInformation = deasync(function(eatery, fields, cb) {
    request({
        headers: {
            'user-key': process.env.ZOMATO_USER_KEY
        },
        url: 'https://developers.zomato.com/api/v2.1/search?q=' + eatery.name.replace(/\'/g, '') + '&lat=40.106865&lon=-88.227111&radius=9000'
    }, function(error, response, body) {
        var ret = {};
        body = JSON.parse(body);
        if (body.restaurants[0] == undefined) {
        	cb(undefined, { message: 'Could not find restaurant.' });
        	return;
        }
        if (fields.includes('price')) {
            ret.price = body.restaurants[0].restaurant.average_cost_for_two;
        }
        if (fields.includes('rating')) {
            ret.rating = parseFloat(body.restaurants[0].restaurant.user_rating.aggregate_rating);
        }
        cb(undefined, ret);
        return;
    });
});

module.exports = {
	getEateryInformation
};