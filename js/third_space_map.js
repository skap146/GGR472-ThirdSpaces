// map zoom in level after clicking enter btn from search
const zoom_level = 15;

// fetch data from the library json
// Load the library data (we don't want to load it more than once)
let library_locs = new Map()
load_feature_data()
function load_feature_data()
{
    fetch('data/library.geojson')
        .then(response => {
            return response.json()})
        .then(data => {
            let features = data.features;
            console.log(features);

            features.forEach(feature => {
                // append the name and loc of each feature to our library_locs
                library_locs.set(feature.properties["BranchName"], feature["geometry"]["coordinates"])

                // append to the dropdown
                let dropdown_element = document.getElementById('search_third_space')
                let third_space_option = document.createElement('option');
                third_space_option.textContent = feature.properties["BranchName"];
                third_space_option.value = feature.properties["BranchName"];
                dropdown_element.appendChild(third_space_option);
            })
        })
}

//
const enter_btn = document.getElementById('enter_btn');
enter_btn.addEventListener('click', function(){
    let name = document.getElementById('search_third_space').value;
    let coords = library_locs.get(name);
    map.flyTo({center: coords, zoom: zoom_level});
})

// Current active pop up
let activePopUp = null;



// Access token for mapbox
mapboxgl.accessToken = 'pk.eyJ1Ijoia2FwY2Fuc2giLCJhIjoiY21rNDRqY3NyMDN6OTNlb2p0MGNoMmt3NyJ9.dJfye3FVRxijxl2_diGcPQ';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'my-map', // map container ID
    style: 'mapbox://styles/mapbox/standard', // style URL
    center: [-79.39, 43.66], // starting position [lng, lat] - centered in Toronto
    zoom: 12}) // starting zoom level

// // create geocoder
// const geocoder = new MapboxGeocoder({
//     accessToken: mapboxgl.accessToken,
//     mapboxgl: mapboxgl,
//     countries: "ca"
// });

// Append geocoder variable to goeocoder HTML div to position on page
// document.getElementById('my-geocoder').appendChild(geocoder.onAdd(map));

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

// Add interactivity for third space points
thirdSpaceInteractivity()
function thirdSpaceInteractivity()
{
    const library_field_data = [
        {'display_name': 'Name', 'field_name': 'BranchName'},
        {'display_name': 'Address', 'field_name': 'Address'},
        {'display_name': 'Phone', 'field_name': 'Telephone'}]

    const child_centre_data = [
        {'display_name': 'Name', 'field_name': 'buildingName'},
        {'display_name': 'Address', 'field_name': 'full_address'},
        {'display_name': 'Phone', 'field_name': 'phone'}]

    const places_of_worship_data = [
        {'display_name': 'Name', 'field_name': 'PLACE_NAME'},
        {'display_name': 'Address', 'field_name': 'ADDRESS_FULL'},
        {'display_name': 'Phone', 'field_name': 'FTH_PHONE'},
        {'display_name': 'Faith', 'field_name': 'FTH_FAITH'}]

    const community_centre_data = [
            {'display_name': 'Name', 'field_name': 'ASSET_NAME'},
        {'display_name': 'Address', 'field_name': 'ADDRESS'},
        {'display_name': 'Phone', 'field_name': 'PHONE'}]

    makeLayerInteractive('library-click-interaction', 'library_point', library_field_data);
    makeLayerInteractive('childcentre-click-interaction', 'early_child_centre_point', child_centre_data);
    makeLayerInteractive('placesofworship-click-interaction', 'places_of_worship_point', places_of_worship_data);
    makeLayerInteractive('commcentre-click-interaction', 'comm_centre_point', community_centre_data);

}

// Create third space pop up and buffer function
function makeLayerInteractive(interaction_name, layer_id, field_names) {
    map.addInteraction(interaction_name, {
        type: 'click',
        target: { layerId: layer_id},
        handler: (e) => {
            // Create a walkability buffer around the user point
            console.log(e.feature.geometry.coordinates)

            // Generate pop up message based on field data
            let msg = ""
            console.log(field_names);
            field_names.forEach(item => {
                msg += `<div>${item.display_name}: ${e.feature.properties[item.field_name]}</div>`;
            })
            msg += "<button class='walkability_btn'>Show Walkability</button>"

            // Display the pop up with a walkability option
            activePopUp = new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(msg)
                .addTo(map);

            // If the user clicks on the walkability button, displays walkability buffer around point
            activePopUp.getElement().querySelector('.walkability_btn').addEventListener('click', () => {
                    activePopUp.remove();
                    createBuffer(e.feature.geometry.coordinates)
                }
            )
        }
    });
}


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

    // clear map pop up and buffer
    resetMap()
}

// Create buffer when user clicked on point
function createBuffer(coords)
{
    // Convert coordinates to turf point
    let point = turf.point(coords,
        {"marker-color": "#0F0"})

    // Buffer 500 m (starting point) for our clicked third space point
    const dist = 500
    let buffer = turf.buffer(point, dist, {units: "metres"})
    console.log(buffer)

    // Remove previous query data (if it exists)
    if (map.getLayer('walkability_buffer_polygon'))
    {
        map.removeLayer('walkability_buffer_polygon');
        map.removeSource('walkability_buffer_data');
    }

    // Add the data from the new user query to the map
    map.addSource('walkability_buffer_data', {type: 'geojson',data: buffer});
    map.addLayer({
        'id': 'walkability_buffer_polygon',
        'type': 'fill',
        'source': 'walkability_buffer_data',
        'paint': {
            'fill-color': '#888888', // Test alternative colours and style properties
            'fill-opacity': 0.4,
            'fill-outline-color': 'black'
        }
    });


}

// Handle reset logic
// Check if user clicked on a third space layer
map.on('click', e => {const features = map.queryRenderedFeatures(e.point, {
    layers: [
        'library_point',
        'early_child_centre_point',
        'places_of_worship_point',
        'comm_centre_point'
    ]
});

// If nothing is clicked, remove pop up and buffer data
    if (!features.length) {
        resetMap();
    }
    else {
        // Remove the buffer if it exists
        if (map.getLayer('walkability_buffer_polygon'))
        {
            map.removeLayer('walkability_buffer_polygon');
            map.removeSource('walkability_buffer_data');
        }
    }
    }
)

// Removes the active pop up from the map
function resetMap() {
    // If active pop up exists, remove and set to null
    console.log('ONE!');
    if (activePopUp) {
        activePopUp.remove();
        activePopUp = null;
    }

    // Remove the buffer if it exists
    if (map.getLayer('walkability_buffer_polygon'))
    {
        map.removeLayer('walkability_buffer_polygon');
        map.removeSource('walkability_buffer_data');
    }

}