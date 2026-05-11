// Fetch real neighborhood polygons from Overpass API and output them as JS
const query = `[out:json];
area["name"="Brașov"]["admin_level"="6"]->.city;
(
  relation["boundary"="administrative"]["admin_level"~"9|10"](area.city);
);
out geom;`;

async function main() {
  console.log('Fetching neighborhood boundaries from Overpass API...');
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`
  });
  const data = await res.json();
  console.log(`Found ${data.elements.length} boundaries`);
  
  for (const el of data.elements) {
    const name = el.tags?.name || 'unknown';
    if (el.members) {
      // Count outer way members to understand polygon complexity
      const outerWays = el.members.filter(m => m.role === 'outer' && m.geometry);
      const totalPoints = outerWays.reduce((sum, w) => sum + (w.geometry?.length || 0), 0);
      console.log(`  ${name}: ${outerWays.length} outer ways, ${totalPoints} points`);
    }
  }
}

main().catch(e => console.error(e));
