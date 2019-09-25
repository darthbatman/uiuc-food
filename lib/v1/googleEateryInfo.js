const request = require('request');
const deasync = require('deasync');

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

function getCampusCityFromAddress(address) {
  if (address.includes('Champaign')) {
    return 'Champaign';
  }
  if (address.includes('Urbana')) {
    return 'Urbana';
  }
  return 'Savoy';
}

const getEateryInformation = deasync((eatery, cb) => {
  const some = `${eatery.name} ${getCampusCityFromAddress(eatery.locations[0].address)}, IL`;
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
};
