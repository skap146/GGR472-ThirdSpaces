// Access token for mapbox
mapboxgl.accessToken = 'pk.eyJ1Ijoia2FwY2Fuc2giLCJhIjoiY21rNDRqY3NyMDN6OTNlb2p0MGNoMmt3NyJ9.dJfye3FVRxijxl2_diGcPQ';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'my-map', // map container ID
    style: 'mapbox://styles/mapbox/standard', // style URL
    center: [-79.39, 43.66], // starting position [lng, lat] - centered in Toronto
    zoom: 12}) // starting zoom level

map.on('load', () =>
{
    // Load external GeoJSON files
    map.addSource('library_data', {type: 'geojson',data: 'data/library.geojson'});
    map.addSource('early_child_centre_data', {type: 'geojson', data: 'data/EarlyONChildCentres.geojson'});
    map.addSource('comm_centre_data', {type: 'geojson', data: 'data/community_centres.geojson'});
    map.addSource('places_of_worship_data', {type: 'geojson', data: 'data/Places_of_Worship.geojson'});

    // Visualize building layer
    map.addLayer({
        'id': 'library_point',
        'type': 'circle',
        'source': 'library_data',
        'paint': {
            'circle-radius': 5,
            'circle-color': '#007cbf'
        }
    });

    // Visualize early child centres layer
    map.addLayer({
        'id': 'early_child_centre_point',
        'type': 'circle',
        'source': 'early_child_centre_data',
        'paint': {
            'circle-radius': 5,
            'circle-color': '#d16411'
        }
    });

    // Visualize parks and rec layer
    map.addLayer({
        'id': 'comm_centre_point',
        'type': 'circle',
        'source': 'comm_centre_data',
        'paint': {
            'circle-radius': 5,
            'circle-color': '#006911'
        }
    });

    // Visualize places of worship layer
    map.addLayer({
        'id': 'places_of_worship_point',
        'type': 'circle',
        'source': 'places_of_worship_data',
        'paint': {
            'circle-radius': 5,
            'circle-color': '#b8116a'
        }
    });
})

// React to checkbox being enabled/disabled on map
function toggleLayer(layer_id)
{
    const visibility = map.getLayoutProperty(layer_id, 'visibility');

    // Toggle the visibility of the layer
    if (visibility === 'none')
    {
        map.setLayoutProperty(layer_id, 'visibility', 'visible');
    }
    else
    {
        map.setLayoutProperty(layer_id, 'visibility', 'none');
    }
}