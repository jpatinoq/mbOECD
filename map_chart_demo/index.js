/* global turf c3  */

'use strict';
/**
 * Customize this impact tool by filling in the following values to match your data
 */
const config = {
  /**
   * Replace this with your Mapbox Access Token (**Do this first!**)
   */
  accessToken:
    'pk.eyJ1Ijoiam9yZ2VwYXRpbm8iLCJhIjoiY2tnc2R0c20zMWVvdTJ5bXRpZ3Z4bDN1dCJ9.2LgsqgR7lXR6YFH2IaNc-w',
  /**
   * Replace with the url of your map style
   */
  mapStyle: 'mapbox://styles/jorgepatino/cl7qojvxl003715lq9yj206lv', // UGS-Africa-demo
  /**
   * The layer within the vector tileset to use for querying
   */
  sourceLayer: 'DBMetrics_v2-b9wz8l', // maximum density points colored by green fraction, size by population
  /**
   * This sets the title in the sidebar and the <title> tag of the app
   */
  title: 'Air pollution trends and urban green space',
  /**
   * This sets the description in the sidebar
   */
  description:
    'This map shows the urban green space fraction in African urban agglomerations (for 2020) and the chart shows the estimated continental average trend of urban ambient air pollution (PM2.5) from 1998 to 2020. Click on an urban agglomeration to visualize historical data.',
  /**
   * Data fields to chart from the source data
   */
  fields: [
    'X1998',
    'X1999',
    'X2000',
    'X2001',
    'X2002',
    'X2003',
    'X2004',
    'X2005',
    'X2006',
    'X2007',
    'X2008',
    'X2009',
    'X2010',
    'X2011',
    'X2012',
    'X2013',
    'X2014',
    'X2015',
    'X2016',
    'X2017',
    'X2018',
    'X2019',
    'X2020'
  ],
  /**
   * Labels for the X Axis, one for each field
   */
  labels: [
    '1998',
    '1999',
    '2000',
    '2001',
    '2002',
    '2003',
    '2004',
    '2005',
    '2006',
    '2007',
    '2008',
    '2009',
    '2010',
    '2011',
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017',
    '2018',
    '2019',
    '2020'
  ],
  /**
   * The name of the data field to pull the place name from for chart labeling ("Total Votes in placeNameField, placeAdminField")
   */
  placeNameField: 'Agglomeration_Name',
  /**
   * (_Optional_) The name of the administrative unit field to use in chart labeling ("Total Votes in placeNameField, placeAdminField")
   */
  placeAdminField: 'ISO3',
  /**
   * This sets what type of summary math is used to calculate the initial chart, options are 'avg' or 'sum' (default)
   * Use 'avg' for data that is a rate like turnout %, pizzas per capita or per sq mile
   */
  summaryType: 'avg',
  /**
   * Label for the graph line
   */
  dataSeriesLabel: 'Average PM2.5',
  /**
   * Basic implementation of zooming to a clicked feature
   */
  zoomToFeature: true,
  /**
   * Color to highlight features on map on click
   * TODO: add parameter for fill color too?
   */
  highlightColor: '#fff',
  /**
   * (_Optional_) Set this to 'bar' for a bar chart, default is line
   */
  chartType: 'line',
  /**
   * The name of the vector source, leave as composite if using a studio style,
   * change if loading a tileset programmatically
   */
  sourceId: 'composite',

  /**
   * (Experimental) Try to build a legend automatically from the studio style,
   *  only works with a basic [interpolate] expression ramp with stops */
  //autoLegend: true,
  /** The number of decimal places to use when rounding values for the legend, defaults to 1 */
  //autoLegendDecimals: 1,

  /**
   * Legend colors and values, ignored if autoLegend is used. Delete both if no legend is needed.
   */
  legendColors: ['#e1973d', '#dabb67', '#dedc73', '#7eb659', '#0e9a28'],
  legendValues: [0, 0.25, 0.5, 0.75, 0.975],
  /**
   * The name of your choropleth map layer in studio, used for building a legend
   */
  studioLayerName: 'DBMetrics_v2-b9wz8l',
};

/** ******************************************************************************
 * Don't edit below here unless you want to customize things further
 */
/**
 * Disable this function if you edit index.html directly
 */
(() => {
  document.title = config.title;
  document.getElementById('sidebar-title').textContent = config.title;
  document.getElementById('sidebar-description').innerHTML = config.description;
})();

/**
 * We use C3 for charts, a layer on top of D3. For docs and examples: https://c3js.org/
 */
const chart = c3.generate({
  bindto: '#chart',
  data: {
    // TODO make the initial chart have as many points as the number of fields
    columns: [['data', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
    names: { data: config.dataSeriesLabel },
    // To make a bar chart uncomment this line
    type: config.chartType ? config.chartType : 'line',
  },
  axis: {
    x: {
      type: 'category',
      categories: config.labels,
      tick: {
        fit: true,
        outer: false,
        centered: true,
        rotate: 0,
        culling: true,
        multiline: false
      }
    },
    y: {
      min: 12,
      max: 145,
      label: {
        text: 'PM2.5 (ug/m3)',
        position: 'outer-middle'
        },
      tick: {
        format: d3.format(".0f")
      }
    },
  },
  regions: [
    {axis: 'y', end: 12, class: 'regionHealthy'},
    {axis: 'y', start: 12, end: 35.4, class: 'regionModerate'},
    {axis: 'y', start: 35.4, class: 'regionUnhealthy'},
  ],
  size: {
    height: 250,
    width: 550
  },
  padding: {
    bottom: 5,
    left: 45
  },
  color: {
  pattern: ['#9A7D0A']
}
});

let bbFull;
let summaryData = [];
// For tracking usage of our templates
const transformRequest = (url) => {
  const isMapboxRequest =
    url.slice(8, 22) === 'api.mapbox.com' ||
    url.slice(10, 26) === 'tiles.mapbox.com';
  return {
    url: isMapboxRequest ? url.replace('?', '?pluginName=charts&') : url,
  };
};
mapboxgl.accessToken = config.accessToken;
const map = new mapboxgl.Map({
  container: 'map',
  style: config.mapStyle,
  // Change this if you want to zoom out further
  minZoom: 2,
  transformRequest,
});

// Add a scale bar in metric units
const scalebar = new mapboxgl.ScaleControl({
  maxWidth: 100,
  unit: 'metric'
  });  
map.addControl(scalebar);

// Add geocoder control
const geocoder = new MapboxGeocoder({
      // Initialize the geocoder
      accessToken: mapboxgl.accessToken, // Set the access token
      mapboxgl: mapboxgl, // Set the mapbox-gl instance
      marker: false, // Do not use the default marker style
      placeholder: 'Search for cities in Africa', // Placeholder text for the search bar
      bbox: [-30.234375,-36.597889,61.171875,39.095963], // Bounding box for Africa, search results will be limited to that area. (?)
      flyTo: {
        easing: function(t){
            return t;
        },
        zoom: 9, //to zoom to a specified level (not too much!)
      }, 
    });
    
// Add the geocoder to the map
map.addControl(geocoder, 'top-right');

// Add zoom control ( + / -, reset orientation to North)
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

map.once('idle', () => {
  bbFull = map.getBounds();

  buildLegend();

  /** Layer for onClick highlights, to change to a fill see this tutorial: https://docs.mapbox.com/mapbox-gl-js/example/hover-styles/ */
  map.addLayer({
    id: 'DBMetrics_v2-b9wz8l',
    type: 'line-color',
    source: 'composite',
    'source-layer': config.sourceLayer,
    paint: {
      'line-color': config.highlightColor,
      'line-width': 2,
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        0.7,
        0,
      ],
    },
  });
  map.on('click', onMapClick);
  /**
   * 'In contrast to Map#queryRenderedFeatures, this function returns all features matching the query parameters,
   * whether or not they are rendered by the current style (i.e. visible). The domain of the query includes all
   * currently-loaded vector tiles and GeoJSON source tiles: this function does not check tiles outside the currently visible viewport.'
   * https://docs.mapbox.com/mapbox-gl-js/api/map/#map#querysourcefeatures
   *
   * To graph all features within the viewport, change this to queryRenderedFeatures and trigger on 'idle' or 'render'
   * */
  const sourceFeatures = map.querySourceFeatures(config.sourceId, {
    sourceLayer: config.sourceLayer,
  });
  processSourceFeatures(sourceFeatures);
});

document.getElementById('resetButton').onclick = () => {
  if (summaryData) {
    updateChartFromFeatures(summaryData);
    highlightFeature();
  }
  if (bbFull) {
    map.fitBounds(bbFull);
  }
};

function onMapClick(e) {
  const clickedFeature = map
    .queryRenderedFeatures(e.point)
    .filter((item) => item.layer['source-layer'] === config.sourceLayer)[0];
  if (clickedFeature) {
    if (config.zoomToFeature) {
      const bb = turf.bbox(clickedFeature.geometry);
      map.fitBounds(bb, {
        padding: 150, //original value: 150
        maxZoom: 9
      });
    }
    highlightFeature(clickedFeature.id);
    updateChartFromClick(clickedFeature);
  }
}

function processSourceFeatures(features) {
  const uniqueFeatures = filterDuplicates(features);

  const data = uniqueFeatures.reduce(
    (acc, current) => {
      config.fields.forEach((field, idx) => {
        acc[idx] += current.properties[field];
      });
      return acc;
    },
    config.fields.map(() => 0),
  );

  // Save the queried data for resetting later
  if (config.summaryType === 'avg') {
    summaryData = data.map((i) => i / uniqueFeatures.length);
  } else {
    summaryData = data;
  }
  updateChartFromFeatures(summaryData);
}

let activeFeatureId;
function highlightFeature(id) {
  if (activeFeatureId) {
    map.setFeatureState(
      {
        source: config.sourceId,
        sourceLayer: config.sourceLayer,
        id: activeFeatureId,
      },
      { active: false },
    );
  }
  if (id) {
    map.setFeatureState(
      {
        source: config.sourceId,
        sourceLayer: config.sourceLayer,
        id,
      },
      { active: true },
    );
  }
  activeFeatureId = id;
}
// Because tiled features can be split along tile boundaries we must filter out duplicates
// https://docs.mapbox.com/mapbox-gl-js/api/map/#map#querysourcefeatures
function filterDuplicates(features) {
  return Array.from(new Set(features.map((item) => item.id))).map((id) => {
    return features.find((a) => a.id === id);
  });
}

function updateChartFromFeatures(features) {
  chart.load({
    columns: [['data'].concat(features)],
    names: { data: `${config.dataSeriesLabel}` },
  });
}

/**
 * This function takes in the clicked feature and builds a data object for the chart using fields
 * specified in the config object.
 * @param {Object} feature
 */
function updateChartFromClick(feature) {
  const data = config.fields.reduce((acc, field) => {
    acc.push(feature.properties[field]);
    return acc;
  }, []);

  chart.load({
    columns: [['data'].concat(data)],
    names: {
      // Update this to match data fields if you don't have the same data schema, it will look for `name` and `state_abbrev` fields
      data: config.placeAdminField
        ? `${config.dataSeriesLabel} in ${
            feature.properties[config.placeNameField]
          }, ${feature.properties[config.placeAdminField]}`
        : `${config.dataSeriesLabel} in ${
            feature.properties[config.placeNameField]
          }`,
    },
  });
}

/**
 * Builds out a legend from the viz layer
 */
function buildLegend() {
  const legend = document.getElementById('legend');
  const legendColors = document.getElementById('legend-colors');
  const legendValues = document.getElementById('legend-values');
  const legendTitle = document.getElementById('legend-title');

  if (config.autoLegend) {
    legend.classList.add('block-ml');
    const style = map.getStyle();
    const layer = style.layers.find((i) => i.id === config.studioLayerName);
    const fill = layer.paint['fill-color'];
    // Remove the interpolate expression to get the stops
    const stops = fill.slice(3);
    stops.forEach((stop, index) => {
      // Every other value is a value, and then a color. Only iterate over the values
      if (index % 2 === 0) {
        // Default to 1 decimal unless specified in config
        const valueEl = `<div class='col align-center'>${stop.toFixed(
          typeof config.autoLegendDecimals !== 'undefined'
            ? config.autoLegendDecimals
            : 1,
        )}</div>`;
        const colorEl = `<div class='col h12' style='background-color:${
          stops[index + 1]
        }'></div>`;
        legendColors.innerHTML += colorEl;
        legendValues.innerHTML += valueEl;
      }
    });
  } else if (config.legendValues) {
    legend.classList.add('block-ml');
    config.legendValues.forEach((stop, idx) => {
      const key = `<div class='col h12' style='background-color:${config.legendColors[idx]}'></div>`;
      const value = `<div class='col align-center'>${stop}</div>`;
      legendColors.innerHTML += key;
      legendValues.innerHTML += value;
    });
  }
}
