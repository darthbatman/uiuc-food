function formatFormData(formData) {
  let formDataString = '';
  let i;
  for (i = 0; i < Object.keys(formData).length; i += 1) {
    formDataString += `${Object.keys(formData)[i]}=${formData[Object.keys(formData)[i]]}&`;
  }
  return formDataString.slice(0, -1);
}

module.exports = {
  formatFormData,
};
