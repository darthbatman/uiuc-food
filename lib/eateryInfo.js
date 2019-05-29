const request = require('request');
const deasync = require('deasync');

const getEateryInformation = deasync((eatery, fields, cb) => {
  request({
    headers: {
      'user-key': process.env.ZOMATO_USER_KEY,
    },
    url: `https://developers.zomato.com/api/v2.1/search?q=${eatery.name.replace(/'/g, '')}&lat=40.106865&lon=-88.227111&radius=9000`,
  }, (error, response, body) => {
    const ret = {};
    const pb = JSON.parse(body);
    if (pb.restaurants[0] === undefined) {
      cb(undefined, { message: 'Could not find restaurant.' });
      return;
    }
    if (fields.includes('price')) {
      ret.price = pb.restaurants[0].restaurant.average_cost_for_two;
    }
    if (fields.includes('rating')) {
      ret.rating = parseFloat(pb.restaurants[0].restaurant.user_rating.aggregate_rating);
    }
    cb(undefined, ret);
  });
});

module.exports = {
  getEateryInformation,
};
