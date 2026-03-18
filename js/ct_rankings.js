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
    map.addSource('neighbourhoods_data', {type: 'geojson',data: 'data/tor_neighbourhood-demography.geojson'});

    map.addLayer({
        'id': 'neighbourhoods_poly', // Create your own layer ID
        'type': 'fill', // Note this is different to point data
        'source': 'neighbourhoods_data', // Must match source ID from addSource Method
        'paint': {
            'fill-color': '#222222', // Test alternative colours and style properties
            'fill-opacity': 1,
            'fill-outline-color': 'yellow'
        }})
})
