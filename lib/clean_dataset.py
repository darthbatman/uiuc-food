import json


def save_records_to_file(records, filename):
    with open(filename, 'w') as f:
        json.dump(records, indent=4, sort_keys=True, fp=f)


def remove_image_urls(filename):
    with open(filename, 'r') as f:
        records = json.load(f)
        for i in range(len(records)):
            if 'img_url' in records[i]:
                del records[i]['img_url']
    save_records_to_file(records, filename)


def match_phone_numbers(filename):
    with open(filename, 'r') as f:
        records = json.load(f)
        for i in range(len(records)):
            if 'phone_number' in records[i]:
                if len(records[i]['locations']) == len(records[i]['phone_number']):
                    for j in range(len(records[i]['phone_number'])):
                        records[i]['locations'][j]['phone_number'] = records[i]['phone_number'][j]
                    del records[i]['phone_number']
                elif len(records[i]['locations']) > 1 and len(records[i]['phone_number']) == 1:
                    for j in range(len(records[i]['locations'])):
                        records[i]['locations'][j]['phone_number'] = records[i]['phone_number'][0]
                    del records[i]['phone_number']
                elif records[i]['phone_number'] == []:
                    del records[i]['phone_number']
                else:
                    print('Error: Could not match phone number for: ' + records[i]['name'])

    save_records_to_file(records, filename)


def match_websites(filename):
    with open(filename, 'r') as f:
        records = json.load(f)
        for i in range(len(records)):
            if 'website' in records[i]:
                if len(records[i]['website']) > 1:
                    print('Error: Could not match website for: ' + records[i]['name'])
                elif records[i]['website'] == []:
                    del records[i]['website']
                else:
                    for j in range(len(records[i]['locations'])):
                        records[i]['locations'][j]['website'] = records[i]['website'][0]
                    del records[i]['website']
    save_records_to_file(records, filename)


def rename_phone_numbers(filename):
    with open(filename, 'r') as f:
        records = json.load(f)
        for i in range(len(records)):
            for j in range(len(records[i]['locations'])):
                if 'phone_number' in records[i]['locations'][j]:
                    records[i]['locations'][j]['phoneNumber'] = records[i]['locations'][j]['phone_number']
                    del records[i]['locations'][j]['phone_number']
    save_records_to_file(records, filename)


if __name__ == '__main__':
    filename = 'data/file_food_and_drink.json'
    remove_image_urls(filename)
    match_phone_numbers(filename)
    match_websites(filename)
    rename_phone_numbers(filename)
