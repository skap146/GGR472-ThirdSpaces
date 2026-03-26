import geopandas as gpd
import pandas as pd

def return_relevant_cols(curr_cols, sub):
    return {f for f in curr_cols if sub.lower() in f.lower()}

data = gpd.read_file('sanitized_neighbourhood_profiles.csv')
neighbourhoods = gpd.read_file('Neighbourhoods.geojson')
curr_cols = data.columns
print(return_relevant_cols(curr_cols, 'visible'))
new_names = {'Bachelor’s degree or higher': 'bachelor_deg',
             'Total visible minority population': 'visible_minority',
                  'Total - Age groups of the population - 25% sample data': 'total_pop',
                  'Median after-tax income of household in 2020 ($)': 'median_income'}
data = data[new_names.keys()]
data = data.rename(columns=new_names)

# calculate proportional fields
numerator_fields = ['bachelor_deg', 'visible_minority']
denominator_field = 'total_pop'
data['total_pop'] = data['total_pop'].astype(int)
for field in numerator_fields:
    data[field] = data[field].astype(int)
    data[f'{field}_prop'] = data[field] / data[denominator_field]


print(data)

data['Neigh_id'] = data.index + 1

merged = pd.merge(data, neighbourhoods, 'inner', left_on='Neigh_id', right_on='_id1')


merged_gdf = gpd.GeoDataFrame(
    merged, geometry=merged['geometry'], crs="EPSG:4326"
)

merged_gdf.to_file('tor_neighbourhood_demography.geojson', driver='GeoJSON')

