function createMap() {
    chs.map = L.map('map')

    /*
	
        default (for now) is mapbox black and white satellite		
	
    */
    let satellite = L.tileLayer('https://api.mapbox.com/styles/v1/yohman/ckon2lqfc00bu17nrdwdtsmke/tiles/512/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoieW9obWFuIiwiYSI6IkxuRThfNFkifQ.u2xRJMiChx914U7mOZMiZw',
        {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            tileSize: 512,
            zoomOffset: -1,
            accessToken: 'pk.eyJ1IjoieW9obWFuIiwiYSI6IkxuRThfNFkifQ.u2xRJMiChx914U7mOZMiZw'
        })

    /*
	
        labels
	
    */
    let positronLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
        pane: 'labels'
    })

    /*
	
        layer control
	
    */
    L.layerGroup([satellite, positronLabels]).addTo(chs.map);


    /*
	
        Custom panes to assign z-index layers
	
    */
    chs.map.createPane('labels').style.zIndex = 590;
    chs.map.createPane('boundaries').style.zIndex = 580;

    // disable click events
    chs.map.getPane('labels').style.pointerEvents = 'none';

    // default to Los Angeles
    chs.map.fitBounds(chs.mapOptions.bounds)

    /*
	
        add the geocoder
	
    */
    geocoder = L.Control.geocoder({
        position: 'topleft',
        defaultMarkGeocode: false,
        geocoder: new L.Control.Geocoder.mapbox({
            apiKey: 'pk.eyJ1IjoiY2h3b2lwcm9qZWN0IiwiYSI6ImNrdTRjZXkwaTRwaWwycXBtY290MjA5d3gifQ.iyENw-MBBY3_9tMPv7frFg',
            geocodingQueryParams: {
                bounded: 1,
                viewbox: '-119.064863, 35.0780436,-117.04887, 33.19587'
            }
        })
    }).addTo(chs.map);

    geocoder.on('markgeocode', function (event) {
        /*
    	
            remove the pin if it exists
    	
        */
        if (chs.mapLayers.geocodepin) { chs.mapLayers.geocodepin.remove() }

        /*
    	
            geocode and add a pin (marker)
    	
        */
        var center = event.geocode.center;
        chs.mapLayers.geocodepin = L.marker(center).addTo(chs.map);
        chs.map.setView(center, 15);
    });

    /*
	
        user location
	
    */
    L.control.locate().addTo(chs.map);
}

function addDefaultBaseLayer() {
    chs.mapLayers.baselayer = L.topoJson(chs.data.bgs, {
        stroke: true,
        color: 'white',
        weight: 0.8,
        fill: true,
        fillOpacity: chs.mapOptions.fillOpacity,
        opacity: chs.mapOptions.fillOpacity,
        onEachFeature: onEachFeature,
    }).addTo(chs.map)
}

/*
	
    function to parse csv files
	
*/
function parseCsv(url) {
    return new Promise(function (resolve, reject) {
        Papa.parse(url, {
            download: true,
            header: true,
            complete: resolve
        })
    });
}

/*

    function to parse geojson files

*/
async function getGeoJson(url) {
    return fetch(url)
        .then(response => response.json())
        .catch((error) => {
            console.error('Error:', error);
        });
}

function joinCSV() {
    chs.data.data = []
    chs.mapLayers.baselayer.eachLayer(function (layer) {
        const properties = chs.data.csv[layer.feature.properties.GEOID];
        if (properties) {
            for (key in properties) {
                layer.feature.properties[key] = properties[key];
            }
            chs.data.data.push(layer.feature.properties)
        }
    });
}

function addTooltip() {
    chs.mapLayers.baselayer.getLayers().forEach(function (layer) {

        /*
    	
            set the content html
    	
        */
        let html = (layer.feature.properties['Block_Code'] != '') ? `<div style="font-size:1.6em;border-bottom:1px solid #aaa;font-weight: bold;padding:4px;margin-bottom:8px;">Block code: ${layer.feature.properties['Block_Code']}</div>` : '';
        html += (layer.feature.properties['CSA_Name'] != '') ? `${layer.feature.properties['CSA_Name']}<br>` : '';
        html += (layer.feature.properties['Current_Agency'] != '') ? `${layer.feature.properties['Current_Agency']}<br>` : '';
        html += (layer.feature.properties['Current_Outreach'] != '') ? `Outreach count: ${layer.feature.properties['Current_Outreach']}<br>` : '';
        html += (layer.feature.properties['Current_Outreach_Date'] != '') ? `Last outreach: ${layer.feature.properties['Current_Outreach_Date']}<br>` : '';
        html += (layer.feature.properties['ZIP'] != '') ? `Zip Code: ${layer.feature.properties['ZIP']}` : '';

        if (html != '') {
            html = `<div style="font-size:1.4em">${html}</div>`
            layer.bindTooltip(html, {
                permanent: false,
                opacity: 0.8,
                className: 'tooltip'
            });
        }

    })
}

function selectFeature(e) {
    if (e.type !== 'click' && window.innerWidth < 600) {
        return
    }

    var layer = e.target;

    let properties = layer.feature.properties;

    let geoid = properties.GEOID;

    highlight = chs.mapLayers.highlighted_layer.getLayers().filter(item => item.feature.properties.GEOID === geoid)[0];

    chs.mapLayers.highlighted.eachLayer(layer => chs.mapLayers.highlighted.removeLayer(layer))
    chs.mapLayers.highlighted.addLayer(highlight)
    chs.mapLayers.highlighted.setStyle({
        weight: 4,
        color: '#6A3D9A',
        pane: 'boundaries',
        fill: false
    });
    chs.mapLayers.highlighted.bringToFront();
    chs.mapLayers.highlighted.addTo(chs.map)

    if (e.type === 'click') {
        chs.map.fitBounds(chs.mapLayers.highlighted.getBounds())
    }
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: selectFeature,
        mouseout: selectFeature,
        click: selectFeature
    });
}

function init() {
    const geojsondata = getGeoJson(chs.data.bgs_path)
    const csvdata = parseCsv(chs.data.csv_locate_path)

    /*
	
        put them in a promise to load all data before moving on to the next step
	
    */
    Promise.all(
        [geojsondata, csvdata]
    ).then(
        function (results) {
            /*
                put the data in global variables
            */

            chs.data.bgs = results[0]
            chs.data.csv = {}

            results[1].data.forEach(row => {
                chs.data.csv[row.GEOID] = row
            })

            /*
                create the map and add the first layer
            */
            createMap();

            /*
                Join the geodata to the csv data
            */
            addDefaultBaseLayer();

            // create a geojson for highlighting
            chs.mapLayers.highlighted_layer = L.topoJson(chs.data.bgs, { pane: 'boundaries' })

            joinCSV()

            addTooltip();
        }
    )
}

init();