import json
import requests
import urllib.request
import urllib.parse


BASE_SEARCH_URL = 'https://www.google.com/search?ei=BkPvXNKLNOHv9AP2wYGYCw&q='


def google_encode(parameter):
    encoded_param = urllib.parse.quote(parameter.encode("utf-8"))
    encoded_param = encoded_param.replace('%20', '+')
    return encoded_param + '&oq=' + encoded_param


def get_google_rating(html):
    rating_search_str = 'class="Aq14fc" aria-hidden="true">'
    rating_search_str_idx = html.index(rating_search_str)
    start_idx = rating_search_str_idx + len(rating_search_str)
    end_idx = start_idx + 3
    return float(html[start_idx:end_idx])


def get_google_review_count(html):
    search_str = ' Google reviews</span>'
    if search_str not in html:
        search_str = ' Google review</span>'
    start_idx = html.index(search_str) - 20
    end_idx = html.index(search_str)
    review_count_str = html[start_idx:end_idx]
    start_idx = review_count_str.rfind('>') + 1
    return int(review_count_str[start_idx:].replace(',', ''))


def get_campus_city_from_address(address):
    return address.split(', ')[-2]


def get_google_eatery_info(eatery):
    info = []
    for i in range(len(eatery['locations'])):
        city = get_campus_city_from_address(eatery['locations'][i]['address'])
        query = eatery['name'] + city + ', IL'
        url = BASE_SEARCH_URL + google_encode(query)
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'}
        response = requests.get(url, headers=headers)
        print(url)
        rating = get_google_rating(response.text)
        reviews = get_google_review_count(response.text)
        info.append({'rating': rating, 'reviews': reviews})
    return info


if __name__ == '__main__':
    filename = 'data/file_food_and_drink.json'
    with open(filename, 'r') as f:
        records = json.load(f)
        for record in records:
            print(get_google_eatery_info(record))
