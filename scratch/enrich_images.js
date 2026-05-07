const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function enrichEventsWithImages() {
  const eventsPath = path.join(process.cwd(), 'public', 'events.json');
  if (!fs.existsSync(eventsPath)) {
    console.error('❌ events.json not found!');
    return;
  }

  const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
  console.log(`🚀 Enriching ${events.length} events with real images...`);

  for (let event of events) {
    if (event.url) {
      try {
        console.log(`🔍 Fetching image for: ${event.title}`);
        const response = await axios.get(event.url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 5000
        });
        const $ = cheerio.load(response.data);
        
        // Try multiple selectors for the main image
        const realImage = $('meta[property="og:image"]').attr('content') || 
                          $('meta[name="twitter:image"]').attr('content') ||
                          $('.entry-content img').first().attr('src') ||
                          $('.post-thumbnail img').first().attr('src');

        if (realImage) {
          event.image = realImage;
          console.log(`✅ Found image: ${realImage.substring(0, 50)}...`);
        }
      } catch (err) {
        console.warn(`⚠️ Could not fetch image for ${event.title}: ${err.message}`);
      }
    }
  }

  fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
  console.log('✅ enrichment complete! events.json updated.');
}

enrichEventsWithImages();
