/* *************************** 
 
	Global variables

**************************** */

/*

	namespace

*/ 
let chs = {};

/*

	map variables

*/ 
chs.map;

// all the defaults
chs.mapOptions = {
	lat:    		0,
	lon:    		0,
	zl:     		3,
	fillOpacity:    0.5,
	num_classes:    5,
	field:          'total_pop',
	category_field:	'',
	category_array:	[],
	category_array_toggle:	[],
	category_on_array:	[], // another array to list only categories that are turned on
	scheme:         'quantiles',
	brew: 	 		new classyBrew(),
	choroplethColors: '',
	max_geos:		'', //filtered layer of polygons with max values
	max_geos_toggle: true,
	boundary_label_toggle: true,
	boundary_fill_toggle: false,
	bounds: 		[
		[34.840471137173814,-117.64558196067811],
		[33.65310164305273,-118.95295500755311]
	],

}

/*

layers

*/ 
chs.mapLayers = {
	baselayer:		'',
	boundary: '',
	hilo_markers: L.featureGroup(),
	highlighted: L.featureGroup(),
	highlighted_layer: '',
	selected_geoids: [],
	geocodepin: undefined,
	hiIcon: 		L.icon({
						iconUrl: 'images/hi.png',
					
						iconSize:     [40, 45], // size of the icon
						iconAnchor:   [20, 45], // point of the icon which will correspond to marker's location
						popupAnchor:  [0,-35]
					}),
	
	loIcon: 		L.icon({
						iconUrl: 'images/lo.png',
					
						iconSize:     [40, 45], // size of the icon
						iconAnchor:   [20, 45], // point of the icon which will correspond to marker's location
					}),

}

/*

	panels

*/ 
chs.panels = {
	info: L.control({ position: 'bottomleft' }),
	hideDashboard: true,
	hideTOC: true,
	list_block_codes: [],
	list_agencies: [],
}

/*

	colors

*/ 
chs.palette = ['#6A3D9A','#FF7F00','#33A02C','#1F78B4','#E31A1C'];

/*

	data

*/ 
chs.data = {
	bgs:		'',
	google:		'',
	csv:		'',
	csv2:		'',
	bgs_path:	'data/boundaries/bg_topo.json',
	// google_path:'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBdJuAIqA2SBcJ-uf38wM0Ce7POFWVTFx6VnjjeC_5yLfw3HDBHDr7uOr0mAnEF1piO2DRDhuDCl2U/pub?gid=1680290540&single=true&output=csv',

	// data
	// google_path:'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBdJuAIqA2SBcJ-uf38wM0Ce7POFWVTFx6VnjjeC_5yLfw3HDBHDr7uOr0mAnEF1piO2DRDhuDCl2U/pub?gid=1817338334&single=true&output=csv',
	google_path: '../data/merged_vaccination_data.csv',

	// boundaries
	google_path2:'https://docs.google.com/spreadsheets/d/e/2PACX-1vT_wXhGkIVT9ycNcstNtxT7jInahpGrdXufF4jSWRX86SykNEdzJM8qwIhY4sClD-N2JnYuUFvHvjkA/pub?gid=0&single=true&output=csv',

	// variables
	google_path3:'https://docs.google.com/spreadsheets/d/e/2PACX-1vSRRN5l0jIjHBeP9-ShFLB8lzHk7O-hfVJ_WGYc4ZyZAa1f5b9D1ushQ2v8YzPfXUMe-z8wkVejWbgc/pub?gid=0&single=true&output=csv',

	csv_path:	'data/acs_vars_results_blockgroups.csv', // not used anymore
	csv_path2:	'data/bg_results/bg_new.csv',
	// boundaries: [
	// 	{
	// 		text: 'Service Planning Areas (2012)',
	// 		id: 'SPA',
	// 		path: 'data/spa.geojson',
	// 		name_field: 'name',
	// 		label: true,
	// 		type: 'geojson'
	// 	},
	// 	{
	// 		text: 'LA County Supervisors District (2011)',
	// 		id: 'sd',
	// 		path: 'data/sd.geojson',
	// 		name_field: 'name',
	// 		label: true,
	// 		type: 'geojson'
	// 	},
	// 	{
	// 		text: 'Cities/Communities',
	// 		id: 'neighborhoods',
	// 		path: 'data/latimes_place_lacounty.geojson',
	// 		name_field: 'name',
	// 		label: true,
	// 		type: 'geojson'
	// 	},
	// 	{
	// 		text: 'LA County Regions',
	// 		id: 'regions',
	// 		path: 'data/regions.geojson',
	// 		name_field: 'name',
	// 		label: true,
	// 		type: 'geojson'
	// 	},
	// 	{
	// 		text: 'L.A. City Council District (2012)',
	// 		id: 'council',
	// 		path: 'data/council.geojson',
	// 		name_field: 'name',
	// 		label: true,
	// 		type: 'geojson'
	// 	},
	// 	{
	// 		text: 'Zipcodes',
	// 		id: 'zipcodes',
	// 		path: 'data/boundaries/zipcodes.geojson',
	// 		name_field: 'ZIPCODE',
	// 		label: true,
	// 		type: 'geojson'
	// 	},
	// 	{
	// 		text: 'L.A. Census Block Groups',
	// 		id: 'bg',
	// 		path: 'data/boundaries/bg_topo.json',
	// 		name_field: 'name',
	// 		label: false,
	// 		type: 'topojson'
	// 	},
	// ],
	categorical_variables: [
		{
			geography: 'bg',
			text: 'Agency',
			id: 'Current_Agency',
			type: 'categorical'
		},
	],
	// variables: [
	// 		{
	// 		geography: 'bg',
	// 		text: 'Total Population',
	// 		id: 'Pop_total',
	// 		type: 'choropleth',
	// 		percent: false,
	// 	},
	// 	{
	// 		geography: 'bg',
	// 		text: 'Percent Limited English',
	// 		// id: 'Limited_Eng_per',
	// 		id: 'Limited_Eng',
	// 		pop: 'B16004_001E',
	// 		type: 'choropleth',
	// 		percent: true,
	// 	},
	// 	{
	// 		geography: 'bg',
	// 		text: 'Percent Uninsured',
	// 		id: 'Uninsured',
	// 		pop: 'B27010_001E',
	// 		type: 'choropleth',
	// 		percent: true,
	// 	},
	// 	{
	// 		geography: 'bg',
	// 		text: 'Below 100 percent of the poverty level',
	// 		id: 'Poverty',
	// 		pop: 'B17021_001E',
	// 		type: 'choropleth',
	// 		percent: true,
	// 	},
	// 	{
	// 		geography: 'bg',
	// 		text: 'Percent Hispanic or Latino',
	// 		id: 'Hisp',
	// 		pop: 'Pop_total',
	// 		type: 'choropleth',
	// 		percent: true,
	// 	},
	// 	{
	// 		geography: 'bg',
	// 		text: 'Percent Non Hispanic Asian',
	// 		id: 'NonHisp_asian',
	// 		pop: 'Pop_total',
	// 		type: 'choropleth',
	// 		percent: true,
	// 	},
	// 	{
	// 		geography: 'bg',
	// 		text: 'Percent Non Hispanic Black',
	// 		id: 'NonHisp_black',
	// 		pop: 'Pop_total',
	// 		type: 'choropleth',
	// 		percent: true,
	// 	},
	// 	{
	// 		geography: 'bg',
	// 		text: 'Percent Non Hispanic White',
	// 		id: 'NonHisp_white',
	// 		pop: 'Pop_total',
	// 		type: 'choropleth',
	// 		percent: true,
	// 	},
	// 	{
	// 		geography: 'bg',
	// 		text: 'Percent Non Hispanic Native Hawaiian and Other PI',
	// 		id: 'NonHisp_pi',
	// 		pop: 'Pop_total',
	// 		type: 'choropleth',
	// 		percent: true,
	// 	},
	// 	{
	// 		geography: 'bg',
	// 		text: 'Percent Non Hispanic American Indian and Alaska Native',
	// 		id: 'NonHisp_ai',
	// 		pop: 'Pop_total',
	// 		type: 'choropleth',
	// 		percent: true,
	// 	},
	// 	{
	// 		geography: 'bg',
	// 		text: 'Percent Vaccinated (August 6, 2021)',
	// 		id: 'Current_Vaccination',
	// 		type: 'choropleth',
	// 		percent: true,
	// 	},
	// 	{
	// 		geography: 'bg',
	// 		text: 'Outreach count',
	// 		id: 'Current_Outreach',
	// 		type: 'choropleth',
	// 		percent: false,
	// 	},
	// 	{
	// 		geography: 'bg',
	// 		text: 'Priority Decile',
	// 		id: 'Priority_Decile',
	// 		type: 'choropleth',
	// 		percent: false
	// 	},

	// ],
}