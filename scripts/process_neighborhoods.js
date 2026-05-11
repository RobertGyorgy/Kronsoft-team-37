const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('public/osm_raw.json', 'utf8'));

// ORDER MATTERS: Specific names first to avoid partial matches
const ZONE_MAPPING = [
  { key: 'Bartolomeu Nord', zone: 2 },
  { key: 'Poiana Brașov', zone: 0 },
  { key: 'Centrul istoric (Cetatea)', zone: 0 },
  { key: 'Brașovechi', zone: 0 },
  { key: 'Prund-Schei', zone: 1 },
  { key: 'Bartolomeu', zone: 1 },
  { key: 'Florilor-Craiter', zone: 1 },
  { key: 'Tractorul', zone: 1 },
  { key: 'Scriitorilor', zone: 1 },
  { key: 'Valea Cetății', zone: 1 },
  { key: 'Astra', zone: 1 },
  { key: 'Centrul Nou', zone: 1 },
  { key: 'Est-Zizin', zone: 1 },
  { key: 'Vasile Goldiș', zone: 1 },
  { key: 'Cartierul Toamnei', zone: 1 },
  { key: 'Noua-Dârste', zone: 2 },
  { key: 'Triaj-Hărman', zone: 2 },
  { key: 'Stupini', zone: 2 }
];

const processed = rawData.elements.map(el => {
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

  const rawName = el.tags.name || '';
  let zone = -1;

  for (const mapping of ZONE_MAPPING) {
    if (rawName === mapping.key || rawName.includes(mapping.key)) {
      zone = mapping.zone;
      break;
    }
  }

  if (zone === -1) return null;

  return {
    name: rawName.toUpperCase(),
    zone: zone,
    path: path
  };
}).filter(n => n !== null);

const uniqueMap = new Map();
processed.forEach(p => {
  if (!uniqueMap.has(p.name) || p.path.length > uniqueMap.get(p.name).path.length) {
    uniqueMap.set(p.name, p);
  }
});

fs.writeFileSync('public/brasov_neighborhoods.json', JSON.stringify(Array.from(uniqueMap.values()), null, 2));
console.log(`Successfully updated ${uniqueMap.size} neighborhoods with priority matching.`);
