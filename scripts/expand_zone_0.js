const fs = require('fs');
const turf = require('@turf/turf');

const data = JSON.parse(fs.readFileSync('public/brasov_neighborhoods.json', 'utf8'));

function toTurfPolygon(path) {
  const coords = path.map(p => [p.lng, p.lat]);
  if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
    coords.push([...coords[0]]);
  }
  return turf.polygon([coords]);
}

function toPath(turfPoly) {
  let coords = turfPoly.geometry.coordinates[0];
  if (coords.length > 0) {
    coords = coords.slice(0, coords.length - 1);
  }
  return coords.map(c => ({ lat: c[1], lng: c[0] }));
}

let blockingPolys = [];
data.forEach(item => {
  if (item.zone === 1 || item.zone === 2) {
    try {
      blockingPolys.push(toTurfPolygon(item.path));
    } catch (e) {
      console.error('Error creating turf polygon for', item.name);
    }
  }
});

let newData = [];

data.forEach(item => {
  if (item.zone === 0) {
    try {
      let z0Poly = toTurfPolygon(item.path);
      
      // Buffer Zone 0 by 1.5km to expand into unfilled space
      z0Poly = turf.buffer(z0Poly, 1.5, { units: 'kilometers' });

      // Clip against all Zone 1 and Zone 2 polygons to stop AT their borders
      for (const blockPoly of blockingPolys) {
        if (z0Poly) {
          const diff = turf.difference(turf.featureCollection([z0Poly, blockPoly]));
          if (diff) {
            z0Poly = diff;
          }
        }
      }

      if (z0Poly) {
        if (z0Poly.geometry.type === 'Polygon') {
           item.path = toPath(z0Poly);
           newData.push(item);
        } else if (z0Poly.geometry.type === 'MultiPolygon') {
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
             newData.push(item);
           }
        }
      }
    } catch (e) {
      console.error('Error processing', item.name, e);
      newData.push(item); 
    }
  } else {
    newData.push(item);
  }
});

fs.writeFileSync('public/brasov_neighborhoods.json', JSON.stringify(newData, null, 2));
console.log('Successfully expanded Zone 0 into unfilled space and clipped to borders.');
