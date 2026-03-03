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

// Add pop up functionality for third spaces
thirdSpacePopUps()
function thirdSpacePopUps()
{
    // Trigger a pop up when the user clicks on a library point
   map.addInteraction('library-click-interaction', {
        type: 'click',
        target: { layerId: 'library_point'},
        handler: (e) => {
            // Create a walkability buffer around the user point
            console.log(e.feature.geometry.coordinates)

            // if click .... then createBuffer
            // first click = pop up
            // second click = buffer
            createBuffer(e.feature.geometry.coordinates)

            // Copy coordinates array.
            const name = e.feature.properties["BranchName"];
            const address = e.feature.properties["Address"];
            const phone_number = e.feature.properties["Telephone"]

            new mapboxgl.Popup()
                // Set the pop up to display at the coordinates of mouse click
                .setLngLat(e.lngLat)
                .setHTML("Library:  " + name +
                    "<br> Address:  " + address +
                    "<br> Phone: " + phone_number)
                .addTo(map); // Show popup on map
        }
    });

    // Trigger a pop up when the user clicks on a early ON child centre point
    map.addInteraction('childcentre-click-interaction', {
        type: 'click',
        target: { layerId: 'early_child_centre_point'},
        handler: (e) => {

            console.log(e.feature.properties)

            const name = e.feature.properties["buildingName"];
            const address = e.feature.properties["full_address"];
            const phone_number = e.feature.properties["phone"]

            new mapboxgl.Popup()
                // Set the pop up to display at the coordinates of mouse click
                .setLngLat(e.lngLat)
                .setHTML("Child Centre:  " + name +
                    "<br> Address:  " + address +
                    "<br> Phone: " + phone_number)
                .addTo(map); // Show popup on map
        }
    });

    // Trigger a pop up when the user clicks on a community center point
    map.addInteraction('placesofworship-click-interaction', {
        type: 'click',
        target: { layerId: 'places_of_worship_point'},
        handler: (e) => {

            console.log(e.feature.properties)

            const name = e.feature.properties["PLACE_NAME"];
            const address = e.feature.properties["ADDRESS_FULL"];
            const phone_number = e.feature.properties["FTH_PHONE"];
            const faith = e.feature.properties["FTH_FAITH"];



            new mapboxgl.Popup()
                // Set the pop up to display at the coordinates of mouse click
                .setLngLat(e.lngLat)
                .setHTML("Name:  " + name +
                    "<br> Address:  " + address +
                    "<br> Phone: " + phone_number +
                "<br> Faith: " + faith)
                .addTo(map); // Show popup on map
        }
    });

    // Trigger a pop when the user clicks on a place of worship point
    map.addInteraction('commcentre-click-interaction', {
        type: 'click',
        target: { layerId: 'comm_centre_point'},
        handler: (e) => {

            console.log(e.feature.properties)

            const name = e.feature.properties["ASSET_NAME"];
            const address = e.feature.properties["ADDRESS"];
            const phone_number = e.feature.properties["PHONE"]

            new mapboxgl.Popup()
                // Set the pop up to display at the coordinates of mouse click
                .setLngLat(e.lngLat)
                .setHTML("Community Centre:  " + name +
                    "<br> Address:  " + address +
                    "<br> Phone: " + phone_number)
                .addTo(map); // Show popup on map
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