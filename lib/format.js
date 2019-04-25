function formatFormData(formData) {
	var formDataString = '';
	for (var i = 0; i < Object.keys(formData).length; i++) {
		formDataString += Object.keys(formData)[i] + '=' + formData[Object.keys(formData)[i]] + '&'
	}
	return formDataString.slice(0, -1);
};

module.exports = {
	formatFormData
};