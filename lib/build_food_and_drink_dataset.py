from bs4 import BeautifulSoup
import json
import requests
import urllib.request


def parse_record(record):
    soup = BeautifulSoup(record, 'html.parser')
    record = {
        'name': '',
        'img_url': '',
        'address': '',
        'phone_number': ''
    }
    location_container = soup.findAll('div', {'class': 'location-container'})
    if location_container:
        record['name'] = location_container[0]['data-name']
    location_image = soup.findAll('img', {'class': 'location-img'})
    if location_image:
        record['img_url'] = location_image[0]['src']
    contact_info = ''
    for p_tag in soup.findAll('p'):
        if p_tag.string:
            contact_info += p_tag.string + ' '
    if contact_info[-6] == '-' and contact_info[-10] == '-':
        record['address'] = contact_info[:-14]
        record['phone_number'] = contact_info[-13:-1]
    else:
        record['address'] = contact_info[:-1]
    return record


def get_records_from_web(location_area):
    records = []
    remaining_listings = -1
    next_start_at = 1
    url = 'https://www.visitchampaigncounty.org/things-to-do/food-and-drink'
    while remaining_listings:
        params = {
            'idss_action': 'showMore',
            'idss_startAt': next_start_at,
            'idss_filters[0][name]': 'idss_filter_location',
            'idss_filters[0][value]': location_area
        }
        response = requests.post(url, params)
        if response.text:
            data = json.loads(response.text)
            if remaining_listings < 0:
                remaining_listings = data['total_listings']
            next_start_at = data['nextStartAt']
            for listing in data['listings']:
                record = parse_record(listing)
                records.append(record)
                remaining_listings -= 1
    return records


def get_records_from_file(location_area):
    records = []
    with open('campus_food_edited.txt', 'r') as f:
        lines = f.readlines()
        for line in readlines:
            print(line)


def get_records(location_area, source):
    if source == 'web':
        return get_records_from_web(location_area)
    elif source == 'file':
        return get_records_from_file(location_area)
    else:
        return []


def get_filename_from_location_area(location_area):
    return location_area.lower().replace(' ', '_') + '_food_and_drink.json'


def save_records_to_file(records, filename):
    with open(filename, 'w') as f:
        json.dump(records, indent=4, sort_keys=True, fp=f)


def build_food_and_drink_dataset(source):
    location_areas = ['Campustown', 'Champaign', 'Urbana',
                      'Downtown Champaign', 'Downtown Urbana']
    for location_area in location_areas:
        records = get_records(location_area, source)
        filename = get_filename_from_location_area(location_area)
        save_records_to_file(records, 'data/' + filename)


if __name__ == '__main__':
    build_food_and_drink_dataset('web')
