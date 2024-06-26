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
	lat: 0,
	lon: 0,
	zl: 3,
	fillOpacity: 0.5,
	num_classes: 5,
	field: 'total_pop',
	category_field: '',
	category_array: [],
	category_array_toggle: [],
	category_on_array: [], // another array to list only categories that are turned on
	scheme: 'quantiles',
	choroplethColors: '',
	max_geos: '', //filtered layer of polygons with max values
	max_geos_toggle: true,
	boundary_label_toggle: true,
	boundary_fill_toggle: false,
	bounds: [
		[34.840471137173814, -117.64558196067811],
		[33.65310164305273, -118.95295500755311]
	],
}

/*

layers

*/
chs.mapLayers = {
	baselayer: '',
	boundary: '',
	highlighted: L.featureGroup(),
	highlighted_layer: '',
	selected_geoids: [],
	geocodepin: undefined,
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
chs.palette = ['#6A3D9A', '#FF7F00', '#33A02C', '#1F78B4', '#E31A1C'];

/*
	data
*/
chs.data = {
	bgs_path: 'boundaries/bg_topo.json',
	csv_path: '../data/merged_vaccination_data.csv',
	csv_locate_path: '../data/merged_vaccination_locate_data.csv',
	boundaries: [
		{
			"text": "Service Planning Areas (2012)",
			"id": "SPA",
			"path": "boundaries/spa_topo.json",
			"name_field": "name",
			"label": "TRUE",
			"type": "topojson"
		},
		{
			"text": "LA County Supervisors District (2021)",
			"id": "sd2021",
			"path": "boundaries/sd_2021_topo.json",
			"name_field": "DistName",
			"label": "TRUE",
			"type": "topojson"
		},
		{
			"text": "Cities/Communities",
			"id": "neighborhoods",
			"path": "boundaries/cities_topo.json",
			"name_field": "name",
			"label": "TRUE",
			"type": "topojson"
		},
		{
			"text": "Zipcodes",
			"id": "zipcodes",
			"path": "boundaries/zipcodes_topo.json",
			"name_field": "ZIPCODE",
			"label": "TRUE",
            "type": "topojson"
        },
        {
            "text": "LA Census Tracts 2010",
            "id": "ct",
            "path": "boundaries/ct_s_topo.json",
            "name_field": "geoid10",
            "label": "FALSE",
            "type": "topojson"
        },
        {
            "text": "LA Census Tracts 2020",
            "id": "ct20",
			"path": "boundaries/ct_s_topo_20.json",
			"name_field": "CT20",
			"label": "FALSE",
			"type": "topojson"
		}
	],
	categorical_variables: [
		{
			geography: 'bg',
			text: 'Agency',
			id: 'Current_Agency',
			type: 'categorical'
		},
	],
	variables: [
		{
			"geography": "bg",
			"text": "Total Population",
			"id": "Pop_total",
			"pop": "",
			"type": "choropleth",
			"percent": "FALSE",
			"show": "TRUE"
		},
		{
			"geography": "bg",
			"text": "Percent Limited English",
			"id": "Limited_Eng",
			"pop": "B16004_001E",
			"type": "choropleth",
			"percent": "TRUE",
			"show": "TRUE"
		},
		{
			"geography": "bg",
			"text": "Percent Uninsured",
			"id": "Uninsured",
			"pop": "B27010_001E",
			"type": "choropleth",
			"percent": "TRUE",
			"show": "TRUE"
		},
		{
			"geography": "bg",
			"text": "Below 100 percent of the poverty level",
			"id": "Poverty",
			"pop": "B17021_001E",
			"type": "choropleth",
			"percent": "TRUE",
			"show": "TRUE"
		},
		{
			"geography": "bg",
			"text": "Percent Hispanic or Latino",
			"id": "Hisp",
			"pop": "Pop_total",
			"type": "choropleth",
			"percent": "TRUE",
			"show": "TRUE"
		},
		{
			"geography": "bg",
			"text": "Percent Non Hispanic Asian",
			"id": "NonHisp_asian",
			"pop": "Pop_total",
			"type": "choropleth",
			"percent": "TRUE",
			"show": "TRUE"
		},
		{
			"geography": "bg",
			"text": "Percent Non Hispanic Black",
			"id": "NonHisp_black",
			"pop": "Pop_total",
			"type": "choropleth",
			"percent": "TRUE",
			"show": "TRUE"
		},
		{
			"geography": "bg",
			"text": "Percent Non Hispanic White",
			"id": "NonHisp_white",
			"pop": "Pop_total",
			"type": "choropleth",
			"percent": "TRUE",
			"show": "TRUE"
		},
		{
			"geography": "bg",
			"text": "Percent Non Hispanic Native Hawaiian and Other PI",
			"id": "NonHisp_pi",
			"pop": "Pop_total",
			"type": "choropleth",
			"percent": "TRUE",
			"show": "TRUE"
		},
		{
			"geography": "bg",
			"text": "Percent Non Hispanic American Indian and Alaska Native",
			"id": "NonHisp_ai",
			"pop": "Pop_total",
			"type": "choropleth",
			"percent": "TRUE",
			"show": "TRUE"
		},
		{
			"geography": "bg",
			"text": "Percent Boosted",
			"id": "Current_Vaccination",
			"pop": "",
			"type": "choropleth",
			"percent": "TRUE",
			"show": "TRUE"
		},
		{
			"geography": "bg",
			"text": "Outreach count",
			"id": "Current_Outreach",
			"pop": "",
			"type": "choropleth",
			"percent": "FALSE",
			"show": "TRUE"
		}
	],
}
