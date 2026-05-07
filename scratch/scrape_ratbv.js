const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeRATBV() {
    console.log('🚀 Starting MULTI-STATION Deep Scraper...');
    const stationMap = {};
    const baseUrl = 'https://www.ratbv.ro';
    
    try {
        const { data: mainHtml } = await axios.get(`${baseUrl}/trasee-si-orare/`);
        const $main = cheerio.load(mainHtml);
        const routeLinks = [];

        $main('a[href*="/afisaje/"]').each((i, el) => {
            const href = $main(el).attr('href');
            if (href) {
                const fullLink = href.startsWith('http') ? href : baseUrl + (href.startsWith('/') ? '' : '/') + href;
                if (!routeLinks.includes(fullLink)) routeLinks.push(fullLink);
                const opposite = fullLink.includes('-dus') ? fullLink.replace('-dus', '-intors') : fullLink.replace('-intors', '-dus');
                if (!routeLinks.includes(opposite)) routeLinks.push(opposite);
            }
        });

        console.log(`📌 Scoping ${routeLinks.length} directions...`);

        for (const link of routeLinks) {
            try {
                const lineMatch = link.match(/afisaje\/([\w\d]+)-([\w]+)\.html/);
                if (!lineMatch) continue;
                const line = lineMatch[1].toUpperCase();
                const direction = lineMatch[2]; // 'dus' or 'intors'

                const listUrl = link.replace('.html', '/div_list_ro.html');
                const baseUrlAfisaje = listUrl.substring(0, listUrl.lastIndexOf('/') + 1);

                console.log(`🔍 Scraping Line ${line} (${direction})...`);
                const { data: listHtml } = await axios.get(listUrl);
                const $list = cheerio.load(listHtml);
                
                $list('a[href*="line_"]').each((i, el) => {
                    const timetableHref = $list(el).attr('href');
                    const stationName = $list(el).find('b').text().trim().toUpperCase();
                    if (!timetableHref || !stationName) return;

                    // Group by exact name to merge DUS and INTORS for the same hub
                    const stationKey = stationName;

                    if (!stationMap[stationKey]) {
                        stationMap[stationKey] = {
                            name: stationName,
                            lines: {}
                        };
                    }
                    // Use line + direction as internal key to avoid overwriting if a line stops twice
                    const directionSuffix = direction === 'intors' ? ' (Intors)' : '';
                    stationMap[stationKey].lines[`${line}${directionSuffix}`] = baseUrlAfisaje + timetableHref;
                });
                
                await new Promise(r => setTimeout(r, 100));
            } catch (e) { 
                console.error(`❌ Error on ${link}:`, e.message);
            }
        }

        // Final output: stationMap already grouped by Name
        fs.writeFileSync('./public/transit_data.json', JSON.stringify(stationMap, null, 2));
        console.log(`✨ DONE! Captured ${Object.keys(stationMap).length} UNIQUE hubs.`);
    } catch (e) {
        console.error('CRITICAL ERROR:', e);
    }
}

scrapeRATBV();
