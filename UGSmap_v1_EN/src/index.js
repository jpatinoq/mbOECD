
        // The value for 'accessToken' begins with 'pk...'
        mapboxgl.accessToken = 
        'pk.eyJ1IjoibWttZCIsImEiOiJjbDlnMzg5eTUwY3ZnNDBzMmN2cHUzNXExIn0.3t4xo2Y1HJ8idfDDyKp7Mg';
        const map = new mapboxgl.Map({
            container: 'map', //container id
            // Replace YOUR_STYLE_URL with your style URL.
            style: 'mapbox://styles/mkmd/cl9fukm90000e14qs0in5694z', //UGS (EN) from OECD mapbox account
            center: [2, 13.5],
            zoom: 4,
        });

        /*
          Create a popup, specify its options
          and properties, and add it to the map.
        */
        const popup = new mapboxgl.Popup({
            className: "MBpopup",
            closeButton: false,
            closeOnClick: false,
            maxWidth: 200,
        });

    //Add an event listener that runs when a user hovers on the map element.
        map.on('mouseenter', 'ugs-centroids', (e) => {
            // change the cursor style as a UI indicator
            map.getCanvas().style.cursor = 'pointer';
            // Copy coordinates array
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = 
                `<strong style="color:white">${e.features[0].properties.agglosName}</strong>
                <p style="color:white; font-size: 90%">
                    Greenspace cover: ${((e.features[0].properties.UGS_fraction)*100).toFixed(1)}%<br> 
                    PM<sub>2.5</sub> (2019): ${e.features[0].properties.PM25_2019.toFixed(2)} &#13197/m<sup>3</sup><br>
                    Mean temperature: ${e.features[0].properties.annual_mean_temp.toFixed(1)} C<br>
                    Annual precipitation: ${e.features[0].properties.annual_precipitation.toFixed(0)} mm<br>
                    Agroecological zone: ${e.features[0].properties.AEZ_NAME}<br>
                    Population (2015): ${(e.features[0].properties.Pop2015 / 1000000).toFixed(2)} M
                </p>`

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            popup.setLngLat(coordinates).setHTML(description).addTo(map);
        });

        map.on('mouseleave', 'ugs-centroids', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
    
    //Add an event listener that runs when a user hovers on the map element.
        map.on('mousemove', 'ugs-polygons', (e) => {
            // change the cursor style as a UI indicator
            map.getCanvas().style.cursor = 'pointer';
            
            const description = 
                `<strong style="color:white">${e.features[0].properties.agglosName}</strong>
                <p style="color:white; font-size: 90%">
                    Greenspace cover: ${((e.features[0].properties.UGS_fraction)*100).toFixed(1)}%<br> 
                    PM<sub>2.5</sub> (2019): ${e.features[0].properties.PM25_2019.toFixed(2)} &#13197/m<sup>3</sup><br>
                    Mean temperature: ${e.features[0].properties.annual_mean_temp.toFixed(1)} C<br>
                    Annual precipitation: ${e.features[0].properties.annual_precipitation.toFixed(0)} mm<br>
                    Agroecological zone: ${e.features[0].properties.AEZ_NAME}<br>
                    Population (2015): ${(e.features[0].properties.Pop2015 / 1000000).toFixed(2)} M
                </p>`
            
            popup.setLngLat(e.lngLat).setHTML(description).addTo(map);
        });

        map.on('mouseleave', 'ugs-polygons', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

    // Add a geocoding box to search places (cities)
    const geocoder = new MapboxGeocoder({
      // Initialize the geocoder
      accessToken: mapboxgl.accessToken, // Set the access token
      mapboxgl: mapboxgl, // Set the mapbox-gl instance
      marker: false, // Do not use the default marker style
      placeholder: 'Search for cities in Africa', // Placeholder text for the search bar
      bbox: [-30.234375,-36.597889,61.171875,39.095963], // Bounding box for Africa, search results will be limited to that area. (?)
      language: "en",
      flyTo: {
        easing: function(t){
            return t;
        },
        zoom: 8, //to zoom to a specified level (not too much!)
      }, 
    });
    
    // Add the geocoder to the map
    map.addControl(geocoder);
    
    // Add fullscreen control
    map.addControl(new mapboxgl.FullscreenControl(), 'top-left');
    
    // Add zoom control ( + / -, reset orientation to North)
    map.addControl(new mapboxgl.NavigationControl({showCompass: false}), 'top-left');
    
    // Add a scale bar in metric units
    const scalebar = new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
    });
    
    map.addControl(scalebar);


