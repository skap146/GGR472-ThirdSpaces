import geopandas as gpd

df = gpd.read_file('Parks_and_Rec.geojson')

df_types = set(list(df['TYPE']))

comm_centres = df[df['TYPE'] == 'Community Centre']
print(df_types)
print(comm_centres)

comm_centres.to_file('community_centres.geojson')