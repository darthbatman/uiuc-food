import json
import requests
import urllib.request

URL_MAP_DEVELOPERS = 'https://www.mapdevelopers.com/'
GEOCODE_ENDPOINT = 'data.php?operation=geocode'
ERROR_COORDINATE_NOT_FOUND = 'Could not find coordinate.'


def get_coordinate_for_address(address):
    form_data = {'address': address}
    url = URL_MAP_DEVELOPERS + GEOCODE_ENDPOINT
    response = requests.post(url, form_data)
    if response.text:
        data = json.loads(response.text)
        return data
    return {'error': ERROR_COORDINATE_NOT_FOUND}
