const request = require('request');
const deasync = require('deasync');

const format = require('./format.js');

const URL_MAP_DEVELOPERS_GEOCODE = 'https://www.mapdevelopers.com/data.php?operation=geocode';
const ERROR_COORDINATE_NOT_FOUND = 'Could not find coordinate.';

const getCoordinateForAddress = deasync((address, cb) => {
  const formData = { address };
  request.post({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    url: URL_MAP_DEVELOPERS_GEOCODE,
    body: format.formatFormData(formData),
  }, (error, response, body) => {
    if (body === undefined) {
      cb(undefined, { message: ERROR_COORDINATE_NOT_FOUND });
    }
    const pb = JSON.parse(body);
    if (pb.data.length === 0) {
      cb(undefined, { message: ERROR_COORDINATE_NOT_FOUND });
    } else {
      cb(undefined, [{ latitude: pb.data.lat, longitude: pb.data.lng }, pb.data.formatted_address]);
    }
  });
});

module.exports = {
  getCoordinateForAddress,
};
