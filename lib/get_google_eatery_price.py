import json
import requests
import urllib.request
import urllib.parse


BASE_SEARCH_URL = 'https://www.google.com/search?ei=BkPvXNKLNOHv9AP2wYGYCw&q='


def google_encode(parameter):
    encoded_param = urllib.parse.quote(parameter.encode("utf-8"))
    encoded_param = encoded_param.replace('%20', '+')
    return encoded_param + '&oq=' + encoded_param


def get_google_eatery_prices(eatery):
    prices = []
    for i in range(len(eatery['locations'])):
        query = eatery['name'] + ' ' + eatery['locations'][i]['address']
        url = BASE_SEARCH_URL + google_encode(query)
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'}
        response = requests.get(url, headers=headers)
        html = response.text
        rating_search_str = 'class="YhemCb"'
        if rating_search_str not in html:
            continue
        prices.append(len(html.split(rating_search_str)[1].split('>')[1].split('<')[0]))
    return prices


def save_records_to_file(records, filename):
    with open(filename, 'w') as f:
        json.dump(records, indent=4, sort_keys=True, fp=f)


if __name__ == '__main__':
    filename = 'data/file_food_and_drink.json'
    with open(filename, 'r') as f:
        records = json.load(f)
        for i in range(len(records)):
            prices = get_google_eatery_prices(records[i])
            if len(prices) != len(records[i]['locations']):
                print('Error: Incorrect info count for: ' + records[i]['name'])
            else:
                for j in range(len(records[i]['locations'])):
                    records[i]['locations'][j]['price'] = prices[j]
    save_records_to_file(records, filename)
