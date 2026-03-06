import json


def convert_to_geojson(json_file: str):
    data = None
    feature_arr =[]
    with open(json_file) as file:
        data = json.load(file)

        features = data['features']

    for feature in features:
        coords = [feature['geometry']['coordinates'][0][0], feature['geometry']['coordinates'][0][1]]

        feature.pop("geometry")

        feature["geometry"] =  {
            "coordinates": coords,
            "type": "Point"}

        feature_arr.append(feature)

    geojson = {"type": "FeatureCollection", "features": feature_arr}

    with open('community_centres.geojson', 'w') as file:
        json.dump(geojson, file, indent=2)

convert_to_geojson('community_centres.geojson')
