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
  // Handle both Polygon and MultiPolygon
  const geom = turfPoly.geometry;
  if (geom.type === 'Polygon') {
    let coords = geom.coordinates[0];
    if (coords.length > 0) coords = coords.slice(0, coords.length - 1);
    return coords.map(c => ({ lat: c[1], lng: c[0] }));
  } else if (geom.type === 'MultiPolygon') {
    // Return largest component for simplicity in our path-based system
    let maxArea = -1;
    let bestCoords = null;
    for (const polyCoords of geom.coordinates) {
      const p = turf.polygon(polyCoords);
      const area = turf.area(p);
      if (area > maxArea) {
        maxArea = area;
        let c = polyCoords[0];
        if (c.length > 0) c = c.slice(0, c.length - 1);
        bestCoords = c.map(pt => ({ lat: pt[1], lng: pt[0] }));
      }
    }
    return bestCoords;
  }
  return [];
}

const zones = { 0: [], 1: [], 2: [] };

data.forEach(item => {
  try {
    const poly = toTurfPolygon(item.path);
    zones[item.zone].push(poly);
  } catch (e) {
    console.error(`Error processing ${item.name}`, e);
  }
});

const mergedData = [];

[0, 1, 2].forEach(z => {
  const polys = zones[z];
  if (polys.length === 0) return;

  try {
    // Union all polygons in this zone
    let merged = polys[0];
    for (let i = 1; i < polys.length; i++) {
      const union = turf.union(turf.featureCollection([merged, polys[i]]));
      if (union) merged = union;
    }

    // If it's a MultiPolygon (non-touching parts), we should keep all parts as separate items in our list
    if (merged.geometry.type === 'MultiPolygon') {
      merged.geometry.coordinates.forEach((coords, idx) => {
        const poly = turf.polygon(coords);
        let path = coords[0];
        if (path.length > 0) path = path.slice(0, path.length - 1);
        mergedData.push({
          name: `ZONA ${z} - SECTOR ${idx + 1}`,
          zone: z,
          path: path.map(pt => ({ lat: pt[1], lng: pt[0] }))
        });
      });
    } else {
      mergedData.push({
        name: `ZONA ${z}`,
        zone: z,
        path: toPath(merged)
      });
    }
  } catch (e) {
    console.error(`Error merging zone ${z}`, e);
    // Fallback: keep original if merge fails
    // (This is rare with turf but safe)
  }
});

fs.writeFileSync('public/brasov_neighborhoods.json', JSON.stringify(mergedData, null, 2));
console.log(`Successfully merged polygons into ${mergedData.length} mega-zones.`);
