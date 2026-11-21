const mapEl = document.getElementById("map");

if (mapEl && typeof mapboxgl !== "undefined") {
  const token = mapEl.dataset.token;
  const lng = parseFloat(mapEl.dataset.lng);
  const lat = parseFloat(mapEl.dataset.lat);
  const locationName = mapEl.dataset.location;

  if (token && !Number.isNaN(lng) && !Number.isNaN(lat)) {
    mapboxgl.accessToken = token;
    const coordinates = [lng, lat];

    // Create Map
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: coordinates,
      zoom: 13,
    });

    // Controls: zoom, fullscreen, scale, current location
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new mapboxgl.ScaleControl());
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
    );

    // Popup (built with textContent, so listing text can't inject HTML)
    const popupContent = document.createElement("div");
    const popupTitle = document.createElement("h5");
    popupTitle.textContent = locationName;
    const popupText = document.createElement("p");
    popupText.textContent = "Exact location provided after booking.";
    popupContent.append(popupTitle, popupText);

    const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent);

    // Marker
    new mapboxgl.Marker({ color: "red" })
      .setLngLat(coordinates)
      .setPopup(popup)
      .addTo(map);

    // Approximate-area circle after map load
    map.on("load", () => {
      map.addSource("location-circle", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "Point", coordinates },
        },
      });

      map.addLayer({
        id: "circle-layer",
        type: "circle",
        source: "location-circle",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5, 5,
            10, 20,
            13, 60,
            15, 120,
            18, 250,
          ],
          "circle-color": "#ff0000",
          "circle-opacity": 0.4,
          "circle-stroke-color": "#ff0000",
          "circle-stroke-opacity": 0.8,
        },
      });
    });
  }
}