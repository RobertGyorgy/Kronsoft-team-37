const fs = require('fs');
const turf = require('@turf/turf');

const data = JSON.parse(fs.readFileSync('public/brasov_neighborhoods.json', 'utf8'));

// Convert our path format to Turf Polygon format
function toTurfPolygon(path) {
  // Turf polygons need first and last coord to be the same
  const coords = path.map(p => [p.lng, p.lat]);
  if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
    coords.push([...coords[0]]);
  }
  return turf.polygon([coords]);
}

// Convert Turf Polygon back to our path format
function toPath(turfPoly) {
  // Simple polygon without holes
  let coords = turfPoly.geometry.coordinates[0];
  // Remove the duplicate last coordinate for our path format
  if (coords.length > 0) {
    coords = coords.slice(0, coords.length - 1);
  }
  return coords.map(c => ({ lat: c[1], lng: c[0] }));
}

let zone1Polys = [];
data.forEach(item => {
  if (item.zone === 1) {
    try {
      zone1Polys.push(toTurfPolygon(item.path));
    } catch (e) {
      console.error('Error creating turf polygon for', item.name);
    }
  }
});

let clippedData = [];

data.forEach(item => {
  if (item.zone === 0) {
    try {
      let z0Poly = toTurfPolygon(item.path);
      
      // Subtract all Zone 1 polygons from Zone 0
      for (const z1Poly of zone1Polys) {
        if (z0Poly) {
          const diff = turf.difference(turf.featureCollection([z0Poly, z1Poly]));
          if (diff) {
            z0Poly = diff;
          }
        }
      }

      if (z0Poly) {
        // Turf difference might return MultiPolygon if it gets split
        if (z0Poly.geometry.type === 'Polygon') {
           item.path = toPath(z0Poly);
           clippedData.push(item);
        } else if (z0Poly.geometry.type === 'MultiPolygon') {
           // Find largest polygon area
           let maxArea = -1;
           let bestCoords = null;
           for(const polyCoords of z0Poly.geometry.coordinates) {
              const poly = turf.polygon(polyCoords);
              const area = turf.area(poly);
              if (area > maxArea) {
                 maxArea = area;
                 bestCoords = polyCoords[0].slice(0, polyCoords[0].length - 1).map(c => ({ lat: c[1], lng: c[0] }));
              }
           }
           if (bestCoords) {
             item.path = bestCoords;
             clippedData.push(item);
           }
        }
      }
    } catch (e) {
      console.error('Error clipping', item.name, e);
      clippedData.push(item); // Keep original if error
    }
  } else {
    clippedData.push(item);
  }
});

fs.writeFileSync('public/brasov_neighborhoods.json', JSON.stringify(clippedData, null, 2));
console.log('Successfully clipped Zone 0 against Zone 1 overlaps.');
