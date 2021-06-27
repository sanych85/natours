

export const displayMap = (locations)=> {
  mapboxgl.accessToken =
  'pk.eyJ1Ijoic2FueWNoODUiLCJhIjoiY2tuZWxqa3loMm1mZzJycDlsNXo5eHViNCJ9.a1YVnxdXYBcO5Uocpe9vHw';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/sanych85/cknvveen21ype17jg47ayr7o1',
  scrolZoom: false
  //   center: [ -118.11,34.111],
  //   zoom: 8,
  //   interactive:false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  //Add marker
  const el = document.createElement('div');
  el.className = 'marker';
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);
  // Add popup
  new mapboxgl.Popup({
      offset:30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description} </p>`)
    .addTo(map);

  //Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});

}

