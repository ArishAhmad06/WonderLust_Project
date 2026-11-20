
if (
  typeof mapboxgl !== "undefined" &&
  mapToken &&
  listing &&
  listing.geometry &&
  listing.geometry.coordinates &&
  listing.geometry.coordinates.length === 2
) {
  mapboxgl.accessToken = mapToken;

  const coordinates = listing.geometry.coordinates;

  // Create Map
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: coordinates,
    zoom: 13,
  });

  // Zoom Buttons (+ -)
  map.addControl(new mapboxgl.NavigationControl());

  // Full Screen Button
  map.addControl(new mapboxgl.FullscreenControl());

  // Scale
  map.addControl(new mapboxgl.ScaleControl());

  // Current Location Button
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    })
  );

  // Marker
  const popup = new mapboxgl.Popup({
    offset: 25,
  }).setHTML(`
      <h5>${listing.location}</h5>
      <p>Exact location provided after booking.</p>
  `);

  new mapboxgl.Marker({
    color: "red",
  })
    .setLngLat(coordinates)
    .setPopup(popup)
    .addTo(map);

  // Fly Animation
  map.flyTo({
    center: coordinates,
    zoom: 13,
    speed: 1.2,
  });

  // Circle after map load
  map.on("load", () => {
    map.addSource("location-circle", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: coordinates,
        },
      },
    });

    map.addLayer({
      id: "circle-layer",
      type: "circle",
      source: "location-circle",
      paint: {
        // approx 150m radius visual
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          5, 5,
          10, 20,
          13, 60,
          15, 120,
          18, 250
        ],

        "circle-color": "#ff0000",
        "circle-opacity": 0.4,
        "circle-stroke-color": "#ff0000",
        // "circle-stroke-width": 2,
        "circle-stroke-opacity": 0.8,
      },
    });
  });
}