
        // The value for 'accessToken' begins with 'pk...'
        mapboxgl.accessToken = 
        'pk.eyJ1IjoibWttZCIsImEiOiJjajBqYjJpY2owMDE0Mndsbml0d2V1ZXczIn0.el8wQmA-TSJp2ggX8fJ1rA';
        const map = new mapboxgl.Map({
            container: 'map', //container id
            // Replace YOUR_STYLE_URL with your style URL.
            style: 'mapbox://styles/mkmd/clbpmf3rn002115pklj78sktq', //Suicide attacks (FR) from OECD mapbox account
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
        map.on('mouseenter', ['WA_suicide_attacks_2011_2021_f', 'WA_suicide_attacks_2011_2021_m'], (e) => {
            // change the cursor style as a UI indicator
            map.getCanvas().style.cursor = 'pointer';
            // Copy coordinates array
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = 
                `<p style="color:white; font-size: 90%">
                    Victimes: ${e.features[0].properties.fat}<br> 
                    Genre: ${e.features[0].properties.gender}<br>
                    Événements: ${e.features[0].properties.event}
                </p>`;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            popup.setLngLat(coordinates).setHTML(description).addTo(map);
        });

        map.on('mouseleave', ['WA_suicide_attacks_2011_2021_m', 'WA_suicide_attacks_2011_2021_f'], () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
    
    
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


