// map zoom in level after clicking enter btn from search
const zoom_level = 15;

// average walking speed
const avg_walk_speed = 1.3;

// current layers toggled on
let visible_layers = ['library_point', 'early_child_centre_point', 'comm_centre_point', 'places_of_worship_point']

// search for third space dropdown element
const dropdown_element = document.getElementById('third_space_dropdown');

// current buffering distance (on load, it's 500)
let buffer_dist = 500;

// current point to buffer (only one buffer can be active at a time)
let curr_buf_point = null;

// Load all the third space data for the dropdown selector
// names of third spaces and their coordinates
let third_space_locs = new Map();
// names of third spaces and their types
let third_space_types = new Map();
// third space point types and their field names
let type_to_fields = new Map([['library_point', [
    {'display_name': 'Name', 'field_name': 'BranchName'},
    {'display_name': 'Address', 'field_name': 'Address'},
    {'display_name': 'Phone', 'field_name': 'Telephone'}]], ['early_child_centre_point', [
    {'display_name': 'Name', 'field_name': 'buildingName'},
    {'display_name': 'Address', 'field_name': 'full_address'},
    {'display_name': 'Phone', 'field_name': 'phone'}]], ['comm_centre_point', [
    {'display_name': 'Name', 'field_name': 'ASSET_NAME'},
    {'display_name': 'Address', 'field_name': 'ADDRESS'},
    {'display_name': 'Phone', 'field_name': 'PHONE'}]], ['places_of_worship_point', [
    {'display_name': 'Name', 'field_name': 'PLACE_NAME'},
    {'display_name': 'Address', 'field_name': 'ADDRESS_FULL'},
    {'display_name': 'Phone', 'field_name': 'FTH_PHONE'},
    {'display_name': 'Faith', 'field_name': 'FTH_FAITH'}]]]);
load_third_space_dropdown()
function load_third_space_dropdown()
{
    load_layer_in_dropdown('data/library.geojson', 'BranchName', 'library_point');
    load_layer_in_dropdown('data/EARLYONChildCentres.geojson', 'buildingName', 'early_child_centre_point');
    load_layer_in_dropdown('data/community_centres.geojson', 'ASSET_NAME', 'comm_centre_point');
    load_layer_in_dropdown('data/Places_of_Worship.geojson', 'PLACE_NAME', 'places_of_worship_point');
}

// Loads the names for an individual specific that
// Parameters: the third space geoJSON file, the name field of that file, the map to store the loc data
function load_layer_in_dropdown(geoJSON, name_field, type)
{
    // fetches our file
    fetch(geoJSON)
        .then(response => {
            return response.json()})
        .then(data => {
            let features = data.features;

            features.forEach(feature => {
                // append the name and loc of each feature to our third_space_locs
                // include reference to type of third space
                third_space_locs.set(feature.properties[name_field], feature)
                third_space_types.set(feature.properties[name_field], type)

                // append to the dropdown (only if name is defined)
                let third_space_option = document.createElement('div');
                third_space_option.textContent = feature.properties[name_field];
                third_space_option.value = feature.properties[name_field];

                // saves the type of the third space (important for filtering later)
                third_space_option.setAttribute("type", type);

                if (third_space_option.textContent) {
                    dropdown_element.appendChild(third_space_option);
                }
            })
        })
}

//
const enter_btn = document.getElementById('enter_btn');
enter_btn.addEventListener('click', function(){
    let name = document.getElementById('user_input').value;
    let feature = third_space_locs.get(name);
    let coords = feature.geometry.coordinates;
    let click_eve = document.elementFromPoint(coords[0], coords[1]);
    map.flyTo({center: coords, zoom: zoom_level});
    // After flyTo animation finishes, display popup
    map.once('moveend', () => {
        // Construct a synthetic event for your popup function
        let syntheticEvent = {
            lngLat: { lng: coords[0], lat: coords[1] },
            feature: feature
        };

        // Call the display pop up function
        displayPopUp(syntheticEvent, type_to_fields.get(third_space_types.get(name)));
    });
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

    makeLayerInteractive('library-click-interaction', 'library_point', type_to_fields.get('library_point'));
    makeLayerInteractive('childcentre-click-interaction', 'early_child_centre_point', type_to_fields.get('early_child_centre_point'));
    makeLayerInteractive('placesofworship-click-interaction', 'places_of_worship_point', type_to_fields.get('places_of_worship_point'));
    makeLayerInteractive('commcentre-click-interaction', 'comm_centre_point', type_to_fields.get('comm_centre_point'));

}
// Display a pop when a point is clicked
function displayPopUp(e, field_names) {
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

}

// Create third space pop up and buffer function
function makeLayerInteractive(interaction_name, layer_id, field_names) {
    map.addInteraction(interaction_name, {
        type: 'click',
        target: { layerId: layer_id},
        handler: (e) => {
            // Create a walkability buffer around the user point
            console.log(e.feature.geometry.coordinates)

            displayPopUp(e, field_names);

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
// Changes visible third space points as well as searchable third points
// Only visible points can be searched.
function toggleLayer(layer_id)
{
    const visibility = map.getLayoutProperty(layer_id, 'visibility');
    let curr_visibility= ''

    // Toggle the visibility of the layer
    if (visibility === 'none')
    {
        // let layer to visible, ensure all points are in search bar
        map.setLayoutProperty(layer_id, 'visibility', 'visible');
        curr_visibility = 'visible';

        // add the layer to the visible layers variable
        visible_layers.push(layer_id);
    }
    else {
        map.setLayoutProperty(layer_id, 'visibility', 'none');
        curr_visibility = 'none';

        // remove the layer from the visible layers variable
        let index = visible_layers.indexOf(layer_id);
        if (index > -1) {
            visible_layers.splice(index, 1);
        }
    }

    console.log('Visible Layers:' , visible_layers);

    // loop through all third space elements in dropdown selection, and only display
    // third space types that are visible on the map
    let children = dropdown_element.children;
    let length = children.length;
    for (let i = length - 1; i >= 0; i--) {
        let third_space_elem = children[i];

        // if this third space has become invisible on the map, remove it as a search option as well
        // otherwise, if visible on the map, ensure it is visible on the dropdown as well.
        if (third_space_elem.getAttribute('type') === layer_id) {
            if (curr_visibility === 'none')
            {
                third_space_elem.style.display = 'none';
            }
            else {
                third_space_elem.style.display = '';
            }
        }
    }
    resetMap();
}

// Create buffer when user clicked on point
function createBuffer(coords)
{
    // Convert coordinates to turf point
    curr_buf_point = turf.point(coords,
        {"marker-color": "#0F0"})

    // Buffer 500 m (starting point) for our clicked third space point
    let buffer = turf.buffer(curr_buf_point, buffer_dist, {units: "metres"})
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

// // "stored" third spaces, in the dropdown but not selected under name filter
// let stored_spaces = [];

// Filter third spaces by user generated substring
// Keeps all third spaces in the dropdown menu that contain the user generated substring
function searchThirdSpaces(user_str) {
    console.log('1');
    console.log(user_str);

    // show the dropdown menu
    dropdown_element.style.display = 'block';

    // handle empty string case by "filtering for all"
    if (!user_str) {
        user_str = ' ';
    }

    // Loop through each element in the dropdown
    let children = [...dropdown_element.children];
    let length = children.length;
    for (let i = length - 1; i >= 0; i--) {
        let third_space_elem = children[i];

        // Check if user string is in the element name and the element's type is a visible layer, if so keep it.
        // Otherwise, delete.
        // This process converts both strings to uppercase before testing since
        // search should not be case sensitive.
        let third_space_name = third_space_elem.value;
        let third_space_name_upper = third_space_name.toUpperCase();
        let user_str_upper = user_str.toUpperCase()

        if (third_space_name_upper.includes(user_str_upper) &&
            visible_layers.includes(third_space_elem.getAttribute('type'))) {
            third_space_elem.style.display = '';
        }
        else {
            third_space_elem.style.display = 'none';
        }
    }
}
// When user clicks on dropdown element, set it as the current value in search bar
function setThirdSpaceValue (event){
    let value = event.target.value;
    let user_input = document.getElementById('user_input');
    user_input.value = value;
    dropdown_element.style.display = 'none';
}

// React to change in buffer distance
function changebufDist(buf_val) {
    // Update text
    let buffer_msg_elem = document.getElementById('slider_msg');
    let walking_time = Math.round((buf_val / avg_walk_speed) / 60);
    buffer_msg_elem.innerHTML = `Current buffer distance: ${buf_val} m <br> Within a ${walking_time} minute walk`;

    // Change global buf dist
    buffer_dist = buf_val;

    // Update rendered buffer (if it clearly exists on the map)
    if (map.getLayer('walkability_buffer_polygon')) {
        // work on code here
        map.removeLayer('walkability_buffer_polygon');
        map.removeSource('walkability_buffer_data');

        let buffer = turf.buffer(curr_buf_point, buffer_dist, {units: "metres"})
        console.log(buffer)

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
}
