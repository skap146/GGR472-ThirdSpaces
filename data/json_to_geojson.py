import json


def convert_to_geojson(json_file: str):
    data = None
    with open(json_file) as file:
        data = json.load(file)

    feature_arr = []

    for feature in data:

        for key in feature:
            if isinstance(feature[key], str) and feature[key].isnumeric():
                feature[key] = int(feature[key])

        if feature['Lat'] != '' and feature['Long'] != '':
            coords = [float(feature['Long']), float(feature['Lat'])]

            feature.pop('Lat')
            feature.pop('Long')

            feature_arr.append({"type": "Feature", "properties": feature, "geometry": {
                                "coordinates": coords,
                "type": "Point"
            }})

    geojson = {"type": "FeatureCollection", "features": feature_arr}
    print(geojson)

    with open('library.geojson', 'w') as file:
        json.dump(geojson, file, indent=2)

convert_to_geojson('tpl-branch-general-information-2023.json')

"""
"features": [{"type": "Feature",
    "properties": {"name": "Casa Madera",
      "cuisine": "Mexican",
      "num reviews": 638,
      "average rating": 4.9},
    "geometry": {
      "coordinates": [
        -79.40149366083658,
        43.643169006058265
      ],
      "type": "Point"
    }}, {"type": "Feature",
    "properties": {"name": "Harriet's Rooftop",
      "cuisine": "Japanese",
      "num reviews": 206,
      "average rating": 4.8},
    "geometry": {
      "coordinates": [
        -79.40124418782041,
        43.643258022059456
      ],
      "type": "Point"
    }},
 """
