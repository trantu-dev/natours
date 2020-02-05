/* eslint-disable */

export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidHJhbnR1IiwiYSI6ImNrNjN3ZXppazBxeWEzbG1tbHN1NnkweWcifQ.-2TikldHPvz4ww1Zdw6RMQ';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/trantu/ck64mtahq1sca1io7pr1u20qd',
    scrollZoom: false
    // center: [106.666328, 10.786345],
    // zoom: 10,
    // interactive: false
  });

  const llb = new mapboxgl.LngLatBounds();
  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker';

    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    const popup = new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    llb.extend(loc.coordinates);
  });
  map.fitBounds(llb, {
    padding: { top: 200, bottom: 200, left: 100, right: 100 }
  });
};
