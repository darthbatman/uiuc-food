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

function googleEncode(parameter) {
  return `${encodeURIComponent(parameter).replace(/%20/g, '+')}&oq=${encodeURIComponent(parameter).replace(/%20/g, '+')}`;
}

function getGoogleRating(html) {
  return parseFloat(html.substring(html.indexOf('class="rtng" aria-hidden="true">') + 'class="rtng" aria-hidden="true">'.length, html.indexOf('class="rtng" aria-hidden="true">') + 'class="rtng" aria-hidden="true">'.length + 3).trim());
}

function getGoogleReviewCount(html) {
  const something = html.substring(html.indexOf(' Google reviews</span>') - 20, html.indexOf(' Google reviews</span>'));
  return parseInt(something.substring(something.lastIndexOf('>') + 1).trim(), 10);
}

const getGoogleInformation = deasync((eatery, cb) => {
  const some = `${eatery.name} ${eatery.locations[0].address.includes('Champaign') ? 'Champaign' : eatery.locations[0].address.includes('Urbana') ? 'Urbana' : 'Savoy'}, IL`;
  const url = `https://www.google.com/search?ei=BkPvXNKLNOHv9AP2wYGYCw&q=${googleEncode(some)}&gs_l=psy-ab.3..0i71l8.0.0..44268...0.0..0.0.0.......0......gws-wiz.hyxjJXPtdYY`;
  request({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
    },
    url,
  }, (err, res, body) => {
    cb(undefined, { rating: getGoogleRating(body), reviews: getGoogleReviewCount(body) });
  });
});

module.exports = {
  getEateryInformation,
  getGoogleInformation,
};
