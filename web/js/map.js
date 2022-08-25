/* **************************** 

	Initialize

***************************** */

$(document).ready(function () {

	console.log('getting the data...')
	getData();

});

/* **************************** 

	Get the data

***************************** */
function getData() {

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
	function getGeoJson(url) {
		return new Promise(function (resolve, reject) {
			$.getJSON(url, resolve)
		})
	}

	/*
	
		list of data to parse
	
	*/
	const geojsondata = getGeoJson(chs.data.bgs_path)
	const csvdata = parseCsv(chs.data.csv_path)

	/*
	
		put them in a promise to load all data before moving on to the next step
	
	*/
	console.log('start promise...')
	var t0 = performance.now()
	Promise.all(
		[geojsondata, csvdata]
	).then(
		function (results) {
			var t1 = performance.now()
			console.log("Call to get data took " + (t1 - t0) + " milliseconds.")
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
			var t2 = performance.now()
			console.log("Call to make map took " + (t2 - t1) + " milliseconds.")

			createGeoidList()

			addTooltip();

			/*
			
				create the sidebar dropdowns
			
			*/
			createSidebar();
			createInfoPanel();
			$('#toggler').show();
			$('#toggler2').show();
		}
	)
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

/* **************************** 

	Create the initial map

***************************** */
function createMap() {
	chs.map = L.map('map')

	/*
	
		default (for now) is mapbox black and white satellite		
	
	*/
	let satellite = L.tileLayer('https://api.mapbox.com/styles/v1/yohman/ckon2lqfc00bu17nrdwdtsmke/tiles/512/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoieW9obWFuIiwiYSI6IkxuRThfNFkifQ.u2xRJMiChx914U7mOZMiZw',
		{
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox/yohman</a>',
			maxZoom: 18,
			tileSize: 512,
			zoomOffset: -1,
			accessToken: 'pk.eyJ1IjoieW9obWFuIiwiYSI6IkxuRThfNFkifQ.u2xRJMiChx914U7mOZMiZw'
		})

	/*
	
		labels
	
	*/
	let positronLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
		// attribution: cartodbAttribution,
		pane: 'labels'
	})

	/*
	
		satellite color with poi
	
	*/
	let satellitecolor = L.tileLayer('https://api.mapbox.com/styles/v1/yohman/ckrh25hug05w018ndot6lycob/tiles/512/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoieW9obWFuIiwiYSI6IkxuRThfNFkifQ.u2xRJMiChx914U7mOZMiZw',
		{
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox/yohman</a>',
			maxZoom: 18,
			tileSize: 512,
			zoomOffset: -1,
			accessToken: 'pk.eyJ1IjoieW9obWFuIiwiYSI6IkxuRThfNFkifQ.u2xRJMiChx914U7mOZMiZw'
		});


	/*
	
		layer control
	
	*/
	let satelliteGroup = L.layerGroup([satellite, positronLabels]).addTo(chs.map);
	let satelliteColorGroup = L.layerGroup([satellitecolor, positronLabels]);
	let baseMaps = {
		"Satellite (black and white)": satelliteGroup,
		"Satellite (color)": satelliteColorGroup
	}
	L.control.layers(baseMaps).addTo(chs.map);

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
				// countrycodes: 'us',
				bounded: 1,
				viewbox: '-119.064863, 35.0780436,-117.04887, 33.19587'
			}
		})
		// geocoder: new L.Control.Geocoder.Nominatim({
		// 	geocodingQueryParams: {
		// 		// countrycodes: 'us',
		// 		bounded: 1,
		// 		viewbox: '-119.064863, 35.0780436,-117.04887, 33.19587'
		// 	}
		// })
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

	/*
	
		print button
	
	*/
	L.control.browserPrint({
		printModes: ["Portrait", "Landscape"]
	}).addTo(chs.map)
}

function onZoomEnd() {

	if (chs.map.getZoom() > 14) {
		chs.mapLayers.baselayer.getLayers().forEach(function (layer) {
			layer.bindTooltip(layer.feature.properties['GEOID'], {
				permanent: false,
				opacity: 0.8,
				className: 'tooltip'
			});
		})

	}
}

/* **************************** 

	Map themes (choropleths)

***************************** */
function addChoroplethLayer(args) {

	console.log('adding choropleth...')
	/*
	
		clear category array
	
	*/
	chs.mapOptions.category_array = [];
	chs.mapOptions.category_array_toggle = [];



	/*
	
		If reset requested
	
	*/
	if (args.field === null) {
		if (chs.mapLayers.baselayer) {
			// clear the layer
			chs.mapLayers.baselayer.clearLayers()
		}
		$('.legend').empty()
		addDefaultBaseLayer()
	}
	else {
		/*
		
		defaults
		
		*/
		args = args || {};
		chs.mapOptions.field = args.field || chs.mapOptions.field;
		chs.mapOptions.num_classes = args.num_classes || chs.mapOptions.num_classes;
		chs.mapOptions.scheme = args.scheme || chs.mapOptions.scheme;
		if (chs.data.variables.filter(item => item.id === chs.mapOptions.field)[0].pop) {
			chs.mapOptions.pop = chs.data.variables.filter(item => item.id === chs.mapOptions.field)[0].pop
		}
		else {
			chs.mapOptions.pop = undefined
		}


		/*
		
		brew it
		
		*/
		let values = [];

		// based on the provided field, enter each value into the array
		chs.mapLayers.baselayer.getLayers().forEach(function (item, index) {
			//only add if it's a number
			if (!isNaN(item.feature.properties[chs.mapOptions.field])) {
				if (chs.mapOptions.pop) {
					values.push(parseFloat(item.feature.properties[chs.mapOptions.field] / item.feature.properties[chs.mapOptions.pop] * 100))
				}
				else {
					values.push(parseFloat(item.feature.properties[chs.mapOptions.field]))
				}
			}
		})

		// get rid of NaN's
		values = values.filter(e => (e === 0 || e));

		chs.mapOptions.brew.setSeries(values);
		chs.mapOptions.brew.setNumClasses(chs.mapOptions.num_classes);
		chs.mapOptions.brew.setColorCode("RdYlGn");
		chs.mapOptions.brew.classify(chs.mapOptions.scheme);

		/*
		
		clear layers
		
		*/
		if (chs.mapLayers.baselayer) {
			// clear the tooltips first
			if (chs.mapOptions.max_geos) {
				chs.mapOptions.max_geos.forEach(function (layer) {
					layer.unbindTooltip();
				})
			}

			chs.mapLayers.baselayer.clearLayers()
		}

		/*
		
			map it
		
		*/
		chs.mapLayers.baselayer = L.topoJson(chs.data.bgs, {
			style: getStyle, //call a function to style each feature
			onEachFeature: onEachFeature,
		}).addTo(chs.map);

		// add tooltip
		addTooltip();

		// create the legend
		createLegend();
	}

}

/* **************************** 

	Add Tooltip on hover

***************************** */
function addTooltip() {
	chs.mapLayers.baselayer.getLayers().forEach(function (layer) {

		/*
		
			set the content html
		
		*/
		// let html = `<div style="font-size:1.4em">`
		let html = (layer.feature.properties['Block_Code'] != '') ? `<div style="font-size:1.6em;border-bottom:1px solid #aaa;font-weight: bold;padding:4px;margin-bottom:8px;">Block code: ${layer.feature.properties['Block_Code']}</div>` : '';
		html += (layer.feature.properties['CSA_Name'] != '') ? `${layer.feature.properties['CSA_Name']}<br>` : '';
		html += (layer.feature.properties['Current_Agency'] != '') ? `${layer.feature.properties['Current_Agency']}<br>` : '';
		html += (layer.feature.properties['Current_Outreach'] != '') ? `Outreach count: ${layer.feature.properties['Current_Outreach']}<br>` : '';
		html += (layer.feature.properties['Current_Outreach_Date'] != '') ? `Last outreach: ${layer.feature.properties['Current_Outreach_Date']}<br>` : '';
		// html += (layer.feature.properties['CHW_commun']!='') ? `CHW: ${layer.feature.properties['CHW_commun']}<br>` : '';
		// html += '</div>'

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
/* **************************** 

	Create categorical map

***************************** */
let cat_colors = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"];

function addCategoricalLayer(field) {

	console.log('adding categorical layer...')
	// empty themes
	// $('#dropdown-layers').selectivity('clear')

	if (field === null) {
		if (chs.mapLayers.baselayer) {
			chs.mapLayers.baselayer.clearLayers()
		}
		$('.legend').empty()
		addDefaultBaseLayer()

	}
	else {
		chs.mapOptions.category_field = field;

		/*
		
			clear array
		
		*/
		chs.mapOptions.category_array = [];
		chs.mapOptions.category_array_toggle = [];

		/*
		
			get categories
		
		*/
		chs.data.data.forEach(function (item) {
			if (item[chs.mapOptions.category_field] !== '') {
				chs.mapOptions.category_array.push(item[chs.mapOptions.category_field])
			}
		})

		/*
		
			clean up
		
		*/
		// get rid of duplicates
		chs.mapOptions.category_array = [...new Set(chs.mapOptions.category_array)].filter(Boolean)

		// sort it
		chs.mapOptions.category_array.sort();

		// create a toggle reference
		chs.mapOptions.category_array.forEach(function (item) {
			chs.mapOptions.category_array_toggle.push(true)
		})

		/*
		
			clear layers
		
		*/
		if (chs.mapLayers.baselayer) {
			chs.mapLayers.baselayer.clearLayers()
		}

		chs.mapLayers.baselayer = L.topoJson(chs.data.bgs, {
			style: getCategoryStyle,
			onEachFeature: onEachFeature,
		}).addTo(chs.map);

		// add tooltip
		addTooltip();

		createCategoricalLegend();

	}

}

function getCategoryStyle(feature) {
	let index = chs.mapOptions.category_array.indexOf(feature.properties[chs.mapOptions.category_field])

	return {
		stroke: true,
		color: 'white',
		weight: 0.8,
		fill: true,
		fillColor: cat_colors[index],
		fillOpacity: chs.mapOptions.fillOpacity,
		opacity: chs.mapOptions.fillOpacity,
	}
}

/*

	For categorical layer, you can toggle each
	individual category.

	This function receives the index (order number)
	that the requested category is in, and toggles
	that index on/off

*/
function toggleAgency(index) {

	/*
	
		find out if it is on or off
	
	*/
	if (chs.mapOptions.category_array_toggle[index]) {
		fillColor = undefined;
		chs.mapOptions.category_array_toggle[index] = false
		$('#agency-toggle-' + index).removeClass('fa-toggle-on').addClass('fa-toggle-off')
	} else {
		fillColor = cat_colors[index]
		chs.mapOptions.category_array_toggle[index] = true
		$('#agency-toggle-' + index).removeClass('fa-toggle-off').addClass('fa-toggle-on')
	}
	/*
	
		toggle it
	
	*/
	chs.mapLayers.baselayer.eachLayer(function (layer) {
		if (layer.feature.properties.Current_Agency == chs.mapOptions.category_array[index]) {
			layer.setStyle({ fillColor: fillColor })
		}
	})
}

/* **************************** 

	Boundary layers

***************************** */
function addBoundaryLayer(id_text) {

	/*
	
		clear
	
	*/
	if (chs.mapLayers.boundary) {
		chs.mapLayers.boundary.clearLayers()
	}
	$('.boundary-toggle-container').empty();
	chs.mapOptions.boundary_label_toggle = true;

	// find it in the list of layers
	layer2add = chs.data.boundaries.find(({ id }) => id === id_text)

	console.log(layer2add.label)
	/*
	
		add boundary layer
	
	*/
	if (layer2add != undefined) {
		$.getJSON(layer2add.path, function (data) {
			boundary_options = {
				fill: false,
				weight: 1.5,
				pane: 'boundaries',
				onEachFeature: function (feature, layer) {
					if (layer2add.label == 'TRUE') {
						console.log('drawing label...')
						layer.bindTooltip(feature.properties[layer2add.name_field], {
							permanent: true,
							opacity: 0.8,
							className: 'tooltip'
						});
					}
				}
			}
			// geo or topo json?
			if (layer2add.type === 'geojson') {
				chs.mapLayers.boundary = L.geoJson(data, boundary_options).addTo(chs.map)
			}
			else {
				chs.mapLayers.boundary = L.topoJson(data, boundary_options).addTo(chs.map)
			}
		})

		// toggle label on or off?
		if (layer2add.label == 'FALSE') {
			chs.mapOptions.boundary_label_toggle = false;
			$('.sidebar').append(`<div class="boundary-toggle-container" style="margin-left:10px;font-size:0.8em">Labels <i id="boundary-toggle" onclick="toggleBoundaryLabels()" class="fa fa-toggle-off" aria-hidden="true" style="font-size:1.3em"></i></div>`)
		}
		else {
			chs.mapOptions.boundary_label_toggle = true;
			$('.sidebar').append(`<div class="boundary-toggle-container" style="margin-left:10px;font-size:0.8em">Labels <i id="boundary-toggle" onclick="toggleBoundaryLabels()" class="fa fa-toggle-on" aria-hidden="true" style="font-size:1.3em"></i></div>`)
		}

	}
	else {
		console.log('layer ' + id_text + ' not found')
	}
}

function getStyle(feature) {

	if (chs.mapOptions.pop) {
		value = parseFloat(feature.properties[chs.mapOptions.field] / feature.properties[chs.mapOptions.pop] * 100)
	}
	else {
		value = parseFloat(feature.properties[chs.mapOptions.field])
	}

	return {
		stroke: true,
		color: 'white',
		weight: 0.8,
		fill: true,
		fillColor: chs.mapOptions.brew.getColorInRange(value),
		fillOpacity: chs.mapOptions.fillOpacity,
		opacity: chs.mapOptions.fillOpacity,
	}
}


function joinCSV() {

	/*
	
		do the joins
	
	*/
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

function createGeoidList() {
	chs.mapLayers.baselayer.eachLayer(function (item) {
		if (item.feature.properties.Block_Code != '') {
			block_code_object = {
				id: item.feature.properties.GEOID,
				text: `${item.feature.properties.Block_Code} (${item.feature.properties.Current_Agency})`,
				block_code: item.feature.properties.Block_Code
			}
			chs.panels.list_block_codes.push(block_code_object)
			chs.panels.list_agencies.push(item.feature.properties.Current_Agency)
		}
	})

	// get rid of empty values
	chs.panels.list_agencies = chs.panels.list_agencies.filter(item => item);
	chs.panels.list_block_codes = chs.panels.list_block_codes.filter(item => item);

	// get rid of duplicates
	chs.panels.list_agencies = [...new Set(chs.panels.list_agencies)];

	// sort it
	chs.panels.list_agencies.sort();
	chs.panels.list_block_codes.sort(function (a, b) {
		return a.block_code - b.block_code;
	})
}


function toggleBoundaryLabels() {

	if (chs.mapOptions.boundary_label_toggle) {
		chs.mapLayers.boundary.getLayers().forEach(function (layer) {
			layer.unbindTooltip();
		})
		$('#boundary-toggle').removeClass('fa-toggle-on').addClass('fa-toggle-off')
		chs.mapOptions.boundary_label_toggle = false;
	}
	else {
		$('#boundary-toggle').removeClass('fa-toggle-off').addClass('fa-toggle-on')
		chs.mapLayers.boundary.getLayers().forEach(function (layer) {
			layer.bindTooltip(layer.feature.properties[layer2add.name_field], {
				permanent: true,
				opacity: 0.8,
				className: 'tooltip'
			})
		})
		chs.mapOptions.boundary_label_toggle = true;
	}
}