const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/brasov_neighborhoods.json', 'utf8'));

const geojson = {
  type: 'FeatureCollection',
  features: data.map(item => ({
    type: 'Feature',
    properties: {
      name: item.name,
      zone: item.zone,
      color: item.zone === 0 ? '#ea4335' : (item.zone === 1 ? '#fb8c00' : '#34a853')
    },
    geometry: {
      type: 'Polygon',
      // GeoJSON needs [lng, lat] and a closed ring
      coordinates: [
        [...item.path.map(p => [p.lng, p.lat]), [item.path[0].lng, item.path[0].lat]]
      ]
    }
  }))
};

fs.writeFileSync('public/brasov_parking_zones.geojson', JSON.stringify(geojson, null, 2));
console.log('Successfully generated pure information: brasov_parking_zones.geojson');
