import urllib.request
import json
import urllib.parse
kecamatans = ['Keruak', 'Jerowaru', 'Sakra', 'Sakra Barat', 'Sakra Timur', 'Terara', 'Montong Gading', 'Sikur', 'Masbagik', 'Pringgasela', 'Sukamulia', 'Suralaga', 'Selong', 'Labuhan Haji', 'Pringgabaya', 'Suela', 'Aikmel', 'Wanasaba', 'Sembalun', 'Sambelia', 'Lenek']

results = {}
for k in kecamatans:
    district_suffix = '_District'
    lombok_suffix = ',_Lombok_Timur'
    title1 = urllib.parse.quote(k + district_suffix)
    url = f'https://en.wikipedia.org/w/api.php?action=query&prop=coordinates&titles={title1}&format=json'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        data = json.loads(res.read())
        pages = data['query']['pages']
        page = list(pages.values())[0]
        if 'coordinates' in page:
            results[k] = {'lat': page['coordinates'][0]['lat'], 'lng': page['coordinates'][0]['lon']}
        else:
            title2 = urllib.parse.quote(k + lombok_suffix)
            url_id = f'https://id.wikipedia.org/w/api.php?action=query&prop=coordinates&titles={title2}&format=json'
            req_id = urllib.request.Request(url_id, headers={'User-Agent': 'Mozilla/5.0'})
            res_id = urllib.request.urlopen(req_id)
            data_id = json.loads(res_id.read())
            pages_id = data_id['query']['pages']
            page_id = list(pages_id.values())[0]
            if 'coordinates' in page_id:
                 results[k] = {'lat': page_id['coordinates'][0]['lat'], 'lng': page_id['coordinates'][0]['lon']}
            else:
                 results[k] = 'Not found'
    except Exception as e:
        results[k] = str(e)
print(json.dumps(results, indent=2))
