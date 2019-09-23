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


if __name__ == '__main__':
    filename = 'data/file_food_and_drink.json'
    remove_image_urls(filename)
