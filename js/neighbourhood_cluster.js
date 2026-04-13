// Access token for mapbox
mapboxgl.accessToken = 'pk.eyJ1Ijoia2FwY2Fuc2giLCJhIjoiY21rNDRqY3NyMDN6OTNlb2p0MGNoMmt3NyJ9.dJfye3FVRxijxl2_diGcPQ';

// Initialize the map
const map = new mapboxgl.Map({
    container: 'my-map', // map container ID
    style: 'mapbox://styles/mapbox/standard', // style URL
    config: {
        basemap: {
            lightPreset: "morning",
            theme: "faded",
            showRoadLabels: false, showPlaceLabels: false
        },
        show3dObjects: false
    },
    center: [-79.2, 43.72], // starting position [lng, lat] - centered in Toronto
    zoom: 10.2
}) // starting zoom level

// Initialize a variable to store the current pop up
let active_pop_up = new mapboxgl.Popup();

// Color schemes
const color_schemes = {
    blues: ['#8d8ddd', '#4f4fed', '#2222fd', '#0303a6'],
    purples: ['#a076f3', '#8636ff', '#6419ff', '#4204ac'],
    greens: ['#c4f3af', '#88f676', '#36ba1c', '#167507'],
    assorted: ['#37b100', '#b17300', '#b10000', '#0348b6']
}
// Choropleth schemes
const choropleth_schemes = {
    'Cluster': [
        'step',
        ['get', 'Cluster ID'],
        color_schemes['assorted'][0],
        2, color_schemes['assorted'][1],
        3, color_schemes['assorted'][2],
        4, color_schemes['assorted'][3]
    ], 'Third Places Per Capita': [
        'step',
        ['get', 'count_per_capita'],
        color_schemes['blues'][0],
        0.9, color_schemes['blues'][1],
        1.8, color_schemes['blues'][2],
        2.7, color_schemes['blues'][3]
    ], '% Visible Minority': [
        'step',
        ['get', 'visible_minority_prop'],
        color_schemes['purples'][0],
        0.55, color_schemes['purples'][1],
        0.76, color_schemes['purples'][2],
        0.96, color_schemes['purples'][3]
    ], "% Obtained Bachelor's Degree": [
        'step',
        ['get', 'bachelor_deg_prop'],
        color_schemes['greens'][0],
        0.25, color_schemes['greens'][1],
        0.41, color_schemes['greens'][2],
        0.57, color_schemes['greens'][3]
    ], "Median Income": [
        'step',
        ['get', 'median_income'],
        color_schemes['blues'][0],
        80000, color_schemes['blues'][1],
        108000, color_schemes['blues'][2],
        136000, color_schemes['blues'][3]
    ]
}
// Legend titles and data
const legend_titles =
{
    'Cluster': 'Cluster',
    'Third Places Per Capita': 'Third Places Per 1000',
    '% Visible Minority': '% Visible Minority',
    "% Obtained Bachelor's Degree": "% With Bachelor's Degree",
    'Median Income': 'Median Income'
}
const legend_data = {
    'Cluster': [{ 'label': '1', 'colour': color_schemes['assorted'][0] },
    { 'label': '2', 'colour': color_schemes['assorted'][1] },
    { 'label': '3', 'colour': color_schemes['assorted'][2] },
    { 'label': '4', 'colour': color_schemes['assorted'][3] }],
    'Third Places Per Capita': [{ 'label': '0 - 0.9', 'colour': color_schemes['blues'][0] },
    { 'label': '0.9 - 1.8', 'colour': color_schemes['blues'][1] },
    { 'label': '1.8 - 2.7', 'colour': color_schemes['blues'][2] },
    { 'label': '2.7+', 'colour': color_schemes['blues'][3] }],
    '% Visible Minority': [{ 'label': '0 - 55%', 'colour': color_schemes['purples'][0] },
    { 'label': '55 - 76%', 'colour': color_schemes['purples'][1] },
    { 'label': '76 - 96%', 'colour': color_schemes['purples'][2] },
    { 'label': '> 96%', 'colour': color_schemes['purples'][3] }],
    "% Obtained Bachelor's Degree": [{ 'label': '0 - 25%', 'colour': color_schemes['greens'][0] },
    { 'label': '25 - 41%', 'colour': color_schemes['greens'][1] },
    { 'label': '41 - 57%', 'colour': color_schemes['greens'][2] },
    { 'label': '> 57%', 'colour': color_schemes['greens'][3] }],
    "Median Income": [{ 'label': '<$80,000', 'colour': color_schemes['blues'][0] },
    { 'label': '$80,000-$108,000', 'colour': color_schemes['blues'][1] },
    { 'label': '$108,000-$136,000', 'colour': color_schemes['blues'][2] },
    { 'label': '$136,000+', 'colour': color_schemes['blues'][3] }]
}

// whether the map is in hover mode or not (default false)
let hovering = false;

// load_layer_pts
function load_layer_pts(geoJSON) {
    // fetches our file
    return fetch(geoJSON)
        .then(response => response.json())
        .then(data => data.features)
}

// Add map controls
map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// fetch third space points (for aggregation into our neighbourhood polygons)
Promise.all([
    load_layer_pts('data/library.geojson'),
    load_layer_pts('data/early_ON_child_centres.geojson'),
    load_layer_pts('data/Places_of_Worship.geojson'),
    load_layer_pts('data/community_centres.geojson'),
    fetch('data/tor_neighbourhoods_updated.geojson').then(response => response.json())])
    .then(([libraries, earlyON_centres, worship, comm_centres, neighbourhoods]) => {

        const third_place_pts = [...libraries, ...earlyON_centres, ...worship, ...comm_centres];
        let third_place_pts_geojson = { "type": "FeatureCollection", "features": third_place_pts };

        neighbourhoods.features.forEach((neighbourhood) => {
            neighbourhood.properties.median_income = +neighbourhood.properties.median_income;
        })

        // "aggregate" all third space points within each neighbourhood
        let third_places_in_neighbourhoods = turf.collect(neighbourhoods, third_place_pts_geojson, '_id', 'values');

        third_places_in_neighbourhoods.features.forEach(neighbourhood => {
            let count = neighbourhood.properties.values.length;
            neighbourhood.properties.count_per_capita = (count / neighbourhood.properties.total_pop) * 1000;
        })

        map.on('load', () => {
            console.log('third spaces in neighbourhoods: ', third_places_in_neighbourhoods);
            // Load external GeoJSON files
            map.addSource('neighbourhoods_data', { type: 'geojson', data: third_places_in_neighbourhoods });

            map.addLayer({
                'id': 'neighbourhoods_poly', // Create your own layer ID
                'type': 'fill', // Note this is different to point data
                'source': 'neighbourhoods_data', // Must match source ID from addSource Method
                'paint': {
                    'fill-color': choropleth_schemes['Cluster'],
                    'fill-outline-color': '#000000',
                    'fill-opacity': 1
                }
            })

            // set up default pop-up display type (on click)
            updatePopUpInput('On Click');

            // initialize legend rows in the background (hidden)
            initLegend(legend_data['Cluster'], legend_titles['Cluster']);

            // hide the standalone legend on first load because default view is Cluster
            document.getElementById('legend').style.display = 'none';

            // show cluster attributes UI on first load
            document.getElementById('cluster-attributes').style.display = 'block';
            document.getElementById('cluster_desc_btn').style.display = 'inline-block';
            document.getElementById('cluster_desc_btn').textContent = 'Hide Cluster Attributes';
            document.getElementById('cluster-attributes').style.opacity = '1';
        })
    })

// updates the map based on user selected neighbourhood classification
function updateMap(classification_value) {
    map.setPaintProperty('neighbourhoods_poly', 'fill-color', choropleth_schemes[classification_value]);
    
    const legend = document.getElementById('legend');
    const clusterBox = document.getElementById('cluster-attributes');
    const clusterBtn = document.getElementById('cluster_desc_btn');

    if (classification_value === 'Cluster') {
        legend.style.display = 'none';          // hide separate legend for cluster view
        clusterBox.style.display = 'block';     // show cluster attributes box
        clusterBtn.style.display = 'inline-block'; // show toggle button only for cluster view
    } else {
        legend.style.display = 'block';         // show legend for non-cluster views
        clusterBox.style.display = 'none';      // hide cluster attributes box
        clusterBtn.style.display = 'none';      // hide toggle button when not in cluster view
        updateLegend(legend_data[classification_value], legend_titles[classification_value]);
    }
}
// initialize the map legend
function initLegend(legend_data, title) {
    // For each array item create a row to put the label and colour in
    legend_data.forEach(({ label, colour }) => {
        let legend_title = document.getElementById("legend-title");
        legend_title.textContent = title;

        const row = document.createElement('div');
        const colrect = document.createElement('span');

        colrect.className = 'legend-colrect';
        colrect.style.setProperty('--legendcolor', colour);

        const text = document.createElement('span');
        text.className = 'legend-text';
        text.textContent = label;

        row.append(colrect, text);
        legend.appendChild(row);
    });
}
// update the map legend
// This dynamically updates legend based on current classification scheme
function updateLegend(legend_items, title) {
    // Update the legend title
    let legend_title = document.getElementById("legend-title");
    legend_title.textContent = title;

    // Retrieve current legend data
    const legend_rows = document.querySelectorAll('.legend-colrect');
    const text_rows = document.querySelectorAll('.legend-text')

    let index = 0;

    legend_items.forEach(({ label, colour }) => {
        // Update both colour and text elements with the new data
        let legend_row = legend_rows[index]
        let text_row = text_rows[index]

        legend_row.style.setProperty('--legendcolor', colour);
        text_row.textContent = label;

        index++;
    })
}
function updatePopUpInput(input_type) {
    if (input_type === 'None (Disable Pop-Ups)') {
        // remove pop up interactions and current pop up
        map.removeInteraction('neighbourhoods-interaction');
        map.removeInteraction('neighbourhoods-pop-up-remove')
        if (active_pop_up) {
            active_pop_up.remove();
        }

        // set hovering mode to false
        hovering = false;
    }
    else if (input_type === 'On Click') {
        // set hovering mode to false
        hovering = false;

        // remove previous pop up interactions and current pop up
        map.removeInteraction('neighbourhoods-interaction');
        map.removeInteraction('neighbourhoods-pop-up-remove')

        if (active_pop_up) {
            active_pop_up.remove();
        }

        // add on click pop up interaction
        map.addInteraction('neighbourhoods-interaction', {
            type: 'click',
            target: { 'layerId': 'neighbourhoods_poly' },
            handler: (e) => {
                // create pop up as soon as mouse click occurs inside a neighbourhood
                addPopUp(e);
            }
        })
    }
    else if (input_type === 'On Hover') {
        // set hovering mode to false
        hovering = true;

        // remove previous pop up interactions
        map.removeInteraction('neighbourhoods-interaction');
        map.removeInteraction('neighbourhoods-pop-up-remove')
        if (active_pop_up) {
            active_pop_up.remove();
        }

        map.addInteraction('neighbourhoods-interaction', {
            type: 'mousemove',
            target: { 'layerId': 'neighbourhoods_poly' },
            handler: (e) => {
                // create pop up as soon as mouse enters a neighbourhood
                addPopUp(e);
            }
        })
    }
}

// Adds pop up to the map of the currently clicked / hovered on neighbourhood polygon
function addPopUp(e) {
    const count_per_capita = e.feature.properties.count_per_capita;
    const med_income = e.feature.properties.median_income;
    const visible_minority = e.feature.properties.visible_minority_prop;
    const bachelor_degs = e.feature.properties.bachelor_deg_prop;
    const neigh_name = e.feature.properties.AREA_NA7;
    const cluster_id = e.feature.properties["Cluster ID"];

    active_pop_up
        .setLngLat(e.lngLat)
        .setHTML(`<strong> Cluster: </strong> ${cluster_id} 
<br> <strong> Neighbourhood Name: </strong> ${neigh_name} 
                        <br> <strong> Third Places Per Capita: </strong>${roundDecimals(count_per_capita, 2)}
                        <br> <strong> Median Income: </strong>  $${med_income}
                        <br> <strong> % Visible Minority: </strong> ${roundDecimals(visible_minority * 100, 0)}
                        <br> <strong> % Bachelor's Degrees: </strong> ${roundDecimals(bachelor_degs * 100, 0)}`)
        .addTo(map); // Show popup on map
}


// This function rounds numbers to a specified amount of decimal places
function roundDecimals(num, dp) {
    const powOf10 = Math.pow(10, dp)
    return Math.round(num * powOf10) / powOf10;
}

// Event listener to remove popups when hovering outside the neighbourhoods (in hover mode)
map.on('mouseleave', 'neighbourhoods_poly', () => {
    if (hovering) {
        active_pop_up.remove();
    }
});

// Event listener to change cursor visibility
map.on('mouseenter', 'neighbourhoods_poly', () => {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'neighbourhoods_poly', () => {
    map.getCanvas().style.cursor = '';
});

// Add an event listener to toggle on/off the cluster description
let cluster_btn = document.getElementById('cluster_desc_btn');
cluster_btn.addEventListener('click', (e) => {
    let cluster_attributes = document.getElementById('cluster-attributes');
    if (cluster_btn.textContent === 'Hide Cluster Attributes') {
        cluster_btn.textContent = 'Show Cluster Attributes';
        cluster_attributes.style.opacity = '0';
    }
    else {
        cluster_btn.textContent = 'Hide Cluster Attributes';
        cluster_attributes.style.opacity = '1';
    }
})