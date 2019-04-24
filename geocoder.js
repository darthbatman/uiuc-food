const request = require('request');
const deasync = require("deasync");

const format = require('./format.js');

const URL_MAP_DEVELOPERS_GEOCODE = 'https://www.mapdevelopers.com/data.php?operation=geocode';
const HEADER_NAME_CONTENT = 'Content-Type';
const HEADER_VALUE_FORM = 'application/x-www-form-urlencoded';
const FORM_DATA_NAME_ADDRESS = 'address';
const ERROR_COORDINATE_NOT_FOUND = 'Could not find coordinate.';

// TODO: fix callback formatting
var getCoordinateForAddress = deasync(function(address, cb) {
	var formData = {
		[FORM_DATA_NAME_ADDRESS]: address
	};
	request.post({
	  headers: { 
	  	[HEADER_NAME_CONTENT]: HEADER_VALUE_FORM
	  },
	  url: URL_MAP_DEVELOPERS_GEOCODE,
	  body: format.formatFormData(formData)
	}, function(error, response, body) {
		if (body == undefined) {
			cb(undefined, { message: ERROR_COORDINATE_NOT_FOUND });
		}
		body = JSON.parse(body);
		if (body.data.length == 0) {
			cb(undefined, { message: ERROR_COORDINATE_NOT_FOUND });
		} else {
			cb(undefined, [{ latitude: body.data.lat, longitude: body.data.lng }, body.data.formatted_address]);
		}
	});
});

module.exports = {
	getCoordinateForAddress
};