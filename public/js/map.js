
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12',
    center: coordinates,
    zoom: 9,
    attributionControl: true
});

if (Array.isArray(coordinates) && coordinates.length === 2) {
    new mapboxgl.Marker({ color: '#fe424d' })
        .setLngLat(coordinates)
        .addTo(map);
} else {
    console.error('Listing coordinates are invalid:', coordinates);
}

map.on('load', () => map.resize());
map.on('error', (event) => console.error('Mapbox map error:', event.error));