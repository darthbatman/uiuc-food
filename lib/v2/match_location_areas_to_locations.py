import json


def save_records_to_file(records, filename):
    with open(filename, 'w') as f:
        json.dump(records, indent=4, sort_keys=True, fp=f)


def match_location_areas_to_locations(filename):
    with open(filename, 'r') as f:
        records = json.load(f)
        for i in range(len(records)):
            if len(records[i]['locations']) == 1 and \
               len(records[i]['location_areas']) == 1:
                records[i]['locations'][0]['area'] = records[i]['location_areas'][0]
                del records[i]['location_areas']
            else:
                print('Error: Could not match location area for: ' + records[i]['name'])
    save_records_to_file(records, filename)


if __name__ == '__main__':
    filename = 'data/file_food_and_drink.json'
    match_location_areas_to_locations(filename)
