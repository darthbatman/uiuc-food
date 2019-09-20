import json
import sys


def save_records_to_file(records, filename):
    with open(filename, 'w') as f:
        json.dump(records, indent=4, sort_keys=True, fp=f)


def manually_input_location_areas(filename, start=0):
    location_areas = {'ct': 'Campustown', 'du': 'Downtown Urbana',
                      'dc': 'Downtown Champaign', 'u': 'Urbana',
                      'c': 'Champaign', 'o': 'Other'}
    with open(filename, 'r') as f:
        records = json.load(f)
        for i in range(start, len(records)):
            record = records[i]
            print(record['name'])
            for address in record['address']:
                print(address)
                did_enter_location_area = False
                while not did_enter_location_area:
                    ri = input('Enter location areas (comma separated): ')
                    for la in ri.split(','):
                        if la in location_areas:
                            did_enter_location_area = True
                            record['location_areas'].append(location_areas[la])
                        else:
                            print('\'' + ri + '\' is not a location area.')
            records[i] = record
            save_records_to_file(records, filename)
            manually_input_location_areas(filename, start + 1)


if __name__ == '__main__':
    start = 0
    if len(sys.argv) > 1:
        start = int(sys.argv[1])
    manually_input_location_areas('data/file_food_and_drink.json', start)
