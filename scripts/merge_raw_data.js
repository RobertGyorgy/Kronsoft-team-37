const fs = require('fs');

const mainRaw = JSON.parse(fs.readFileSync('public/osm_raw.json', 'utf8'));
const poianaRaw = JSON.parse(fs.readFileSync('public/poiana_raw.json', 'utf8'));

// Merge elements
mainRaw.elements.push(...poianaRaw.elements);

fs.writeFileSync('public/osm_raw.json', JSON.stringify(mainRaw, null, 2));
console.log('Successfully merged Poiana Brașov into the master raw data.');
