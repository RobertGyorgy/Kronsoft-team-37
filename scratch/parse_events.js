const fs = require('fs');
const path = require('path');

async function parseMarkdownEvents() {
  console.log('🚀 Parsing events from already fetched markdown...');
  try {
    const mdPath = 'C:/Users/user/.gemini/antigravity/brain/9572bc9f-3f0e-4c07-81af-8dcf455b7b87/.system_generated/steps/1546/content.md';
    const content = fs.readFileSync(mdPath, 'utf8');
    
    const events = [];
    // Regex to find: ### [Title](URL) followed by [Location](URL)
    const pattern = /### \[(.*?)\]\((.*?)\)\s+\[(.*?)\]\((.*?)\)/g;
    let match;
    let index = 0;

    while ((match = pattern.exec(content)) !== null && index < 15) {
      const [_, title, url, location, locUrl] = match;
      
      events.push({
        id: index,
        title,
        description: `Un eveniment recomandat de Zile și Nopți Brașov la ${location}.`,
        category: mapCategory(title + location),
        date: 'Weekend acesta',
        location: location.split('@')[1]?.trim() || location,
        image: getRandomImage(mapCategory(title + location)),
        url: url.startsWith('http') ? url : `https://zilesinopti.ro${url}`,
        featured: index === 0
      });
      index++;
    }

    const outputPath = path.join(process.cwd(), 'public', 'events.json');
    fs.writeFileSync(outputPath, JSON.stringify(events, null, 2));
    console.log(`✅ Successfully parsed ${events.length} events and saved to public/events.json`);
  } catch (err) {
    console.error('❌ Parsing failed:', err.message);
  }
}

function getRandomImage(cat) {
  const images = {
    'Evenimente': 'https://images.unsplash.com/photo-1514525253361-bee8d48700df?auto=format&fit=crop&q=80&w=800',
    'Natură': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800',
    'Food': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800',
    'Cultură': 'https://images.unsplash.com/photo-1518998053502-517e201f114c?auto=format&fit=crop&q=80&w=800'
  };
  return images[cat] || images['Evenimente'];
}

function mapCategory(text) {
  const c = text.toLowerCase();
  if (c.includes('muzic') || c.includes('concert') || c.includes('pub') || c.includes('taxi')) return 'Evenimente';
  if (c.includes('muzeu') || c.includes('art') || c.includes('teatru') || c.includes('cultur') || c.includes('bibliotec')) return 'Cultură';
  if (c.includes('mancare') || c.includes('food') || c.includes('restaurant') || c.includes('eataly')) return 'Food';
  if (c.includes('cursa') || c.includes('munte') || c.includes('tampa') || c.includes('lacul')) return 'Natură';
  return 'Evenimente';
}

parseMarkdownEvents();
