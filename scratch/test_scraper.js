const axios = require('axios');

function parseHtmlEntities(str) {
    if (!str) return '';
    return str
        .replace(/&#8211;/g, '–')
        .replace(/&#8217;/g, "'")
        .replace(/&#8220;/g, '“')
        .replace(/&#8221;/g, '”')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

async function scrapeEvents() {
    try {
        const response = await axios.get('https://zilesinopti.ro/evenimente-brasov/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 8000
        });
        const html = response.data;
        const items = html.split(/<div class=["']kzn-sw-item["']/);
        const events = [];

        // We skip the first element since it's the HTML before the first item
        for (let i = 1; i < items.length; i++) {
            const block = items[i];

            // 1. Link & Title
            // Format: <h3 class="..."><a href="LINK">TITLE</a></h3>
            const titleMatch = block.match(/<h3[^>]*>\s*<a href=["']([^"']+)["'][^>]*>([^<]+)<\/a>\s*<\/h3>/);
            if (!titleMatch) continue;

            const link = titleMatch[1];
            let rawTitle = titleMatch[2].trim();
            
            // Clean up title (remove location suffix if it has @ and matches location)
            let title = parseHtmlEntities(rawTitle);

            // 2. Summary
            const summaryMatch = block.match(/<div class=["'][^"']*kzn-sw-item-sumar[^"']*["'][^>]*>([\s\S]*?)<\/div>/);
            const description = summaryMatch ? parseHtmlEntities(summaryMatch[1].trim()) : '';

            // 3. Category
            const categoryMatch = block.match(/<div class=['"][^'"]*kzn-sw-item-textsus[^'"]*['"][^>]*>([\s\S]*?)<\/div>/);
            const category = categoryMatch ? categoryMatch[1].trim().toUpperCase() : 'EVENIMENT';

            // 4. Image
            // Format: background-image:url(IMAGE_URL)
            const imgMatch = block.match(/background-image\s*:\s*url\s*\(([^)]+)\)/);
            let imageUrl = imgMatch ? imgMatch[1].replace(/['"]/g, '').trim() : '';

            // Default image fallbacks based on category if missing
            if (!imageUrl) {
                if (category.includes('TEATRU')) {
                    imageUrl = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80';
                } else if (category.includes('CONCERT') || category.includes('MUZICĂ')) {
                    imageUrl = 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80';
                } else if (category.includes('EXPOZI')) {
                    imageUrl = 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80';
                } else {
                    imageUrl = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80';
                }
            }

            // 5. Date & Time
            let eventDate = new Date();
            let parsedTime = '19:00'; // Default time

            // Extract date: <i class='eicon-calendar'></i>Duminică 14/06
            const dateMatch = block.match(/<i class=['"]eicon-calendar['"]><\/i>\s*([^<]+)/);
            if (dateMatch) {
                const dateStr = dateMatch[1].trim(); // e.g. "Duminică 14/06" or "14/06"
                const parts = dateStr.match(/(\d+)\/(\d+)/);
                if (parts) {
                    const day = parseInt(parts[1], 10);
                    const month = parseInt(parts[2], 10) - 1; // 0-indexed
                    eventDate.setDate(day);
                    eventDate.setMonth(month);
                }
            }

            // Extract time: <i class='eicon-clock-o'></i>10:00
            const timeMatch = block.match(/<i class=['"]eicon-clock-o['"]><\/i>\s*([^<]+)/);
            if (timeMatch) {
                parsedTime = timeMatch[1].trim(); // e.g. "10:00"
            }

            const [hours, minutes] = parsedTime.split(':').map(Number);
            eventDate.setHours(hours || 19, minutes || 0, 0, 0);

            // Format to ISO string for Angular's DatePipe
            const when = eventDate.toISOString();

            // 6. Location / Address
            // Format: <div class="...kzn-sw-item-adresa-eveniment..."><i class='eicon-map-pin'></i><a href="...">LOCATION</a></div>
            const locMatch = block.match(/kzn-sw-item-adresa-eveniment[\s\S]*?<a href=[^>]*>([^<]+)<\/a>/);
            const location = locMatch ? parseHtmlEntities(locMatch[1].trim()) : 'Brașov';

            events.push({
                id: i,
                title,
                description,
                category,
                imageUrl,
                when,
                location,
                link
            });
        }

        return events;
    } catch (err) {
        console.error('Error in scraper:', err.message);
        return [];
    }
}

// Run test
scrapeEvents().then(events => {
    console.log(`Successfully scraped ${events.length} events!`);
    console.log('Sample parsed event:', JSON.stringify(events[0], null, 2));
    console.log('Sample parsed event 2:', JSON.stringify(events[1], null, 2));
});
