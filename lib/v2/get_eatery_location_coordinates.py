import json
import geocode


def save_records_to_file(records, filename):
    with open(filename, 'w') as f:
        json.dump(records, indent=4, sort_keys=True, fp=f)


def get_eatery_location_coordinates(filename):
    geocoded_records = []
    with open(filename, 'r') as f:
        records = json.load(f)
        for record in records:
            geocoded_record = {}
            for key in record.keys():
                if key != 'address':
                    geocoded_record[key] = record[key]
            geocoded_record['locations'] = []
            for address in record['address']:
                data = geocode.get_coordinate_for_address(address)['data']
                if data and len(data['address']) > 4:
                    geocoded_record['locations'].append({
                        'address': address,
                        'coordinate': {
                            'lat': data['lat'],
                            'lng': data['lng']
                        }})
                else:
                    print('Error: Could not geocode address: ' + address)
            geocoded_records.append(geocoded_record)
    save_records_to_file(geocoded_records, 'data/file_food_and_drink.json')


if __name__ == '__main__':
    get_eatery_location_coordinates('data/file_food_and_drink.json')
