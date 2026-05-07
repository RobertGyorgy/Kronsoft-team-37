const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeEvents() {
  console.log('🚀 Starting scrape for Zile și Nopți Brașov (using Axios & Cheerio)...');
  try {
    const response = await axios.get('https://zilesinopti.ro/evenimente/brasov/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const events = [];

    // Refined selectors based on actual Zile și Nopți Brașov structure
    $('h3').each((index, element) => {
      const link = $(element).find('a');
      const title = link.text().trim();
      const url = link.attr('href');
      
      // Look for the location in the next paragraph or same container
      const location = $(element).next().text().trim() || 'Brașov';
      
      // Try to find an image in the parent container
      let image = $(element).closest('article').find('img').attr('src') || 
                  $(element).parent().find('img').attr('src');

      if (title && url && title.length > 5 && events.length < 12) {
        events.push({
          id: index,
          title,
          description: `Un eveniment deosebit în Brașov: ${title}.`,
          category: mapCategory(title + location),
          date: 'Weekend acesta',
          location: location.split('@')[1]?.trim() || location,
          image: image || getRandomImage(mapCategory(title + location)),
          url: url.startsWith('http') ? url : `https://zilesinopti.ro${url}`,
          featured: index === 0
        });
      }
    });

    const outputPath = path.join(process.cwd(), 'src', 'assets', 'events.json');
    fs.writeFileSync(outputPath, JSON.stringify(events, null, 2));
    console.log(`✅ Successfully scraped ${events.length} events and saved to src/assets/events.json`);
  } catch (err) {
    console.error('❌ Scraping failed:', err.message);
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

scrapeEvents();
