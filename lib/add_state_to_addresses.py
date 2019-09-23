import json


def save_records_to_file(records, filename):
    with open(filename, 'w') as f:
        json.dump(records, indent=4, sort_keys=True, fp=f)


def add_state_to_addresses(filename):
    with open(filename, 'r') as f:
        records = json.load(f)
        for i in range(len(records)):
            for j in range(len(records[i]['address'])):
                records[i]['address'][j] += ', Illinois'
    save_records_to_file(records, filename)


if __name__ == '__main__':
    add_state_to_addresses('data/file_food_and_drink.json')
