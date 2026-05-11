const fs = require('fs');
const https = require('https');

const query = `
[out:json][timeout:90];
area["name"="Brașov"]->.searchArea;
(
  relation["place"~"suburb|neighbourhood"](area.searchArea);
  way["place"~"suburb|neighbourhood"](area.searchArea);
);
out geom;
`;

const ZONE_MAPPING = {
  'Centrul Vechi': 0, 'Centrul Istoric': 0, 'Poiana Brașov': 0,
  'Schei': 1, 'Prund': 1, 'Bartolomeu': 1, 'Craiter': 1, 'Tractorul': 1, 
  'Florilor': 1, 'Scriitorilor': 1, 'Valea Cetății': 1, 'Răcădău': 1, 
  'Astra': 1, 'Centrul Nou': 1, 'Centrul Civic': 1,
  'Bartolomeu Nord': 2, 'Noua': 2, 'Dârste': 2, 'Triaj': 2, 'Stupini': 2
};

const options = {
  hostname: 'lz4.overpass-api.de',
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (data.includes('<!DOCTYPE') || data.includes('<?xml')) {
      console.error('API returned non-JSON data.');
      return;
    }
    try {
      const osmData = JSON.parse(data);
      const neighborhoods = osmData.elements.map(el => {
        let path = [];
        if (el.type === 'way' && el.geometry) {
          path = el.geometry.map(p => ({ lat: p.lat, lng: p.lon }));
        } else if (el.type === 'relation' && el.members) {
          el.members.forEach(m => {
            if (m.geometry) {
              path.push(...m.geometry.map(p => ({ lat: p.lat, lng: p.lon })));
            }
          });
        }
        
        if (path.length < 3) return null;

        const name = el.tags.name || '';
        let zone = -1;
        for (const [key, val] of Object.entries(ZONE_MAPPING)) {
          if (name === key || name.includes(key)) {
            zone = val;
            break;
          }
        }

        if (zone === -1) return null;

        return {
          name: name,
          zone: zone,
          path: path
        };
      }).filter(n => n !== null);

      fs.writeFileSync('public/brasov_neighborhoods.json', JSON.stringify(neighborhoods, null, 2));
      console.log(`Successfully extracted ${neighborhoods.length} specific neighborhoods.`);
    } catch (e) {
      console.error('Failed to parse OSM data:', e);
    }
  });
});

req.on('error', (e) => console.error('Request error:', e));
req.write('data=' + encodeURIComponent(query));
req.end();
