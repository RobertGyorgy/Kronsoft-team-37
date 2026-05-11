const fs = require('fs');
const turf = require('@turf/turf');

const hdData = JSON.parse(fs.readFileSync('public/poiana_hd_raw.json', 'utf8'));

let features = [];

hdData.elements.forEach(el => {
  if (el.geometry && el.geometry.length >= 2) {
    const coords = el.geometry.map(p => [p.lon, p.lat]);
    
    if (el.tags && el.tags.landuse) {
      // It's a polygon (residential/commercial)
      if (coords[0][0] !== coords[coords.length-1][0]) coords.push(coords[0]);
      features.push(turf.polygon([coords]));
    } else {
      // It's a street
      features.push(turf.lineString(coords));
    }
  }
});

// Buffer streets by 40 meters to cover the driveable area and nearby parking
// Polygons (landuse) don't need buffer, or very small one
let bufferedFeatures = features.map(f => {
  if (f.geometry.type === 'LineString') {
    return turf.buffer(f, 0.04, { units: 'kilometers' });
  }
  return f;
});

// Union everything into one tight mass
let tightPoiana = bufferedFeatures[0];
for (let i = 1; i < bufferedFeatures.length; i++) {
  try {
    const union = turf.union(turf.featureCollection([tightPoiana, bufferedFeatures[i]]));
    if (union) tightPoiana = union;
  } catch (e) {
    // Skip occasional topology errors
  }
}

function toPath(turfPoly) {
  const geom = turfPoly.geometry;
  if (geom.type === 'Polygon') {
    let coords = geom.coordinates[0];
    if (coords.length > 0) coords = coords.slice(0, coords.length - 1);
    return coords.map(c => ({ lat: c[1], lng: c[0] }));
  } else if (geom.type === 'MultiPolygon') {
    // Return all parts as separate sectors or just the biggest?
    // User wants it HD, let's keep the MultiPolygon logic in mind
    // For our path format, we'll return the biggest one for now
    let maxArea = -1;
    let bestCoords = null;
    for (const polyCoords of geom.coordinates) {
      const p = turf.polygon(polyCoords);
      if (turf.area(p) > maxArea) {
        maxArea = turf.area(p);
        let c = polyCoords[0];
        bestCoords = c.slice(0, c.length - 1).map(pt => ({ lat: pt[1], lng: pt[0] }));
      }
    }
    return bestCoords;
  }
  return [];
}

const poianaFinal = {
  name: 'POIANA BRAȘOV (TIGHT)',
  zone: 0,
  path: toPath(tightPoiana)
};

const mainData = JSON.parse(fs.readFileSync('public/brasov_neighborhoods.json', 'utf8'));
const filteredData = mainData.filter(n => !n.name.includes('POIANA') && n.name !== 'ZONA 0 - SECTOR 2');
filteredData.push(poianaFinal);

fs.writeFileSync('public/brasov_neighborhoods.json', JSON.stringify(filteredData, null, 2));
console.log('Successfully generated Ultra-Tight HD Poiana boundary.');
