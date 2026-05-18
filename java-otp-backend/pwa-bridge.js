const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const OTP_BASE_URL = process.env.OTP_URL || 'http://localhost:8080/otp/routers/default';
const GTFS_DATA_PATH = process.env.GTFS_DATA_PATH || path.resolve(__dirname, '../public/gtfs_transit_data.json');

// --- Load .env manually for AI Keys ---
const envPath = path.resolve(__dirname, '../.env');
const env = {};
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim();
    });
}
const GROQ_API_KEY = env.GROQ_API_KEY || process.env.GROQ_API_KEY;

// --- AI ENDPOINT ---
app.post('/api/v1/ai/recommendation', async (req, res) => {
    try {
        const { category, answers } = req.body;
        const prompt = `
          Ești un ghid local expert din Brașov, România. Recomandă EXACT 3 locuri REALE, specifice și populare (sau nestate ascunse) din Brașov pentru categoria "${category}".
          Criterii utilizator: ${Object.values(answers).join(', ')}.
          ID Unic Solicitare: ${Date.now()}.
          
          IMPORTANT: Oferă locații REALE care pot fi găsite pe Google Maps.
          Răspunde DOAR JSON valid:
          {
            "recommendations": [
              { "name": "Nume Locație Reală", "description": "De ce e special acest loc?", "tip": "Un sfat util pentru vizitator." }
            ]
          }
        `;

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.9
        }, {
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` }
        });

        res.json(JSON.parse(response.data.choices[0].message.content));
    } catch (err) {
        console.error('[AI Error]', err.message);
        res.status(500).json({ error: 'AI Recommendation failed' });
    }
});

// --- PARKING ZONES ENDPOINT ---
app.get('/api/v1/parking/zones', (req, res) => {
    res.json([
        { 
            id: 'A', name: 'ZONA A - Centru Istoric', color: '#ff4757', price: 3, 
            coords: { lat: 45.6427, lng: 25.5890 },
            description: 'Piața Sfatului, Strada Republicii și împrejurimi.'
        },
        { 
            id: 'B', name: 'ZONA B - Civic Center', color: '#2f3542', price: 2, 
            coords: { lat: 45.6520, lng: 25.6110 },
            description: 'Bulevardul Victoriei, Centrul Civic, AFI Brașov.'
        },
        { 
            id: 'P', name: 'ZONA POIANA - Stațiune', color: '#1e90ff', price: 5, 
            coords: { lat: 45.5921, lng: 25.5522 },
            description: 'Poiana Brașov - Parcări publice hoteluri și pârtii.'
        }
    ]);
});

// In-memory storage for Reports (Demo purposes)
let reports = [
    {
        id: 1,
        title: 'Groapă adâncă în carosabil',
        location: 'Strada Mureșenilor nr. 12',
        description: 'Groapă periculoasă apărută în urma înghețului, afectează siguranța traficului.',
        category: 'Infrastructură',
        image: '/reports/pothole.png',
        status: 'În lucru',
        date: '2024-05-08'
    },
    {
        id: 3,
        title: 'Punct de colectare supraîncărcat',
        location: 'Cartier Astra, Str. Uranus',
        description: 'Containerele de colectare selectivă sunt pline, gunoiul este depozitat pe lângă ele.',
        category: 'Deșeuri',
        image: '/reports/trash.png',
        status: 'În lucru',
        date: '2024-05-07'
    }
];

// --- AUTH ENDPOINTS ---
app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    res.json({
        accessToken: 'demo-token-' + Date.now(),
        refreshToken: 'demo-refresh',
        tokenType: 'Bearer',
        role: 'USER',
        fullName: email.split('@')[0]
    });
});

app.post('/api/auth/register', (req, res) => {
    res.json({
        accessToken: 'demo-token-' + Date.now(),
        fullName: req.body.fullName
    });
});

app.post('/api/auth/google', (req, res) => {
    res.json({
        accessToken: 'google-token-' + Date.now(),
        fullName: 'Google User'
    });
});

// --- EVENTS SCRAPER & CACHE ---
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

let eventsCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// --- PROMOTED EVENTS PERSISTENCE ---
const promotedEventsFile = path.resolve(__dirname, './promoted_events.json');
let promotedEvents = [];
if (fs.existsSync(promotedEventsFile)) {
    try {
        promotedEvents = JSON.parse(fs.readFileSync(promotedEventsFile, 'utf8'));
        console.log(`[Promoted Events] Loaded ${promotedEvents.length} events from database.`);
    } catch (e) {
        console.error('[Promoted Events] Failed to parse promoted_events.json:', e.message);
    }
}

let backupEvents = [
    {
        id: 1,
        title: "Concert Subcarpați - Turneu 'Valea Voltului'",
        description: "Vino să simți vibrația autentică a folclorului underground într-un concert exploziv la Kruhnen Musik Halle.",
        category: "CONCERT",
        imageUrl: "https://zilesinopti.ro/wp-content/uploads/2024/03/Subcarpati-Valea-Voltului.jpg",
        when: new Date().toISOString(),
        location: "Kruhnen Musik Halle",
        link: "https://zilesinopti.ro/evenimente/sot-fidel-centrul-cultural-reduta/"
    },
    {
        id: 2,
        title: "Street Food Festival Brașov",
        description: "Arome din toată lumea, burgeri artizanali, tacos și delicii asiatice.",
        category: "FESTIVAL",
        imageUrl: "https://zilesinopti.ro/wp-content/uploads/2024/05/Street-Food-Brasov.jpg",
        when: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        location: "Parcul Nicolae Titulescu",
        link: "https://streetfoodfestival.ro"
    }
];

async function getLiveEvents() {
    const now = Date.now();
    if (eventsCache && (now - lastCacheTime < CACHE_DURATION)) {
        console.log('[Events Cache] Returning cached events.');
        return eventsCache;
    }

    try {
        console.log('[Events Scraper] Fetching fresh events from Zile si Nopti...');
        const response = await axios.get('https://zilesinopti.ro/evenimente-brasov/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 8000
        });
        const html = response.data;
        const items = html.split(/<div class=["']kzn-sw-item["']/);
        const events = [];

        for (let i = 1; i < items.length; i++) {
            const block = items[i];

            const titleMatch = block.match(/<h3[^>]*>\s*<a href=["']([^"']+)["'][^>]*>([^<]+)<\/a>\s*<\/h3>/);
            if (!titleMatch) continue;

            const link = titleMatch[1];
            const rawTitle = titleMatch[2].trim();
            const title = parseHtmlEntities(rawTitle);

            const summaryMatch = block.match(/<div class=["'][^"']*kzn-sw-item-sumar[^"']*["'][^>]*>([\s\S]*?)<\/div>/);
            const description = summaryMatch ? parseHtmlEntities(summaryMatch[1].trim()) : '';

            const categoryMatch = block.match(/<div class=['"][^'"]*kzn-sw-item-textsus[^'"]*['"][^>]*>([\s\S]*?)<\/div>/);
            const category = categoryMatch ? categoryMatch[1].trim().toUpperCase() : 'EVENIMENT';

            const imgMatch = block.match(/background-image\s*:\s*url\s*\(([^)]+)\)/);
            let imageUrl = imgMatch ? imgMatch[1].replace(/['"]/g, '').trim() : '';

            if (!imageUrl) {
                const cat = category.toUpperCase();
                const titleLower = title.toLowerCase();

                // --- ȘTIRI / ARTICOLE EDITORIALE ---
                if (cat.includes('FASHION') || titleLower.includes('fashion') || titleLower.includes('chromatique') || titleLower.includes('titor')) {
                    imageUrl = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80'; // Fashion editorial
                } else if (cat.includes('FILM') || cat.includes('PREMIERĂ') || cat.includes('PREMIERA') || titleLower.includes('film') || titleLower.includes('cinema') || titleLower.includes('star wars') || titleLower.includes('mandalorian')) {
                    imageUrl = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80'; // Cinema/film
                } else if (cat.includes('MUZICĂ NOUĂ') || cat.includes('MUZICA NOUA') || titleLower.includes('ce ascultăm') || titleLower.includes('muzică nouă') || titleLower.includes('playlist')) {
                    imageUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'; // Headphones/music editorial
                } else if (cat.includes('CLIN D') || cat.includes('POVESTI') || cat.includes('POVEȘTI') || cat.includes('INTERVIU') || titleLower.includes('interviu') || titleLower.includes('clin d')) {
                    imageUrl = 'https://images.unsplash.com/photo-1478737270197-f849b9f32a0c?auto=format&fit=crop&w=800&q=80'; // Interview/journalism
                } else if (cat.includes('OPINIE') || titleLower.includes('esport') || titleLower.includes('faker') || titleLower.includes('opinie') || titleLower.includes('gen z')) {
                    imageUrl = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'; // Editorial/esports
                } else if (cat.includes('MIXOLOGY') || titleLower.includes('cocktail') || titleLower.includes('mixology') || titleLower.includes('pahar')) {
                    imageUrl = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80'; // Cocktails
                } else if (titleLower.includes('eurovision') || titleLower.includes('rock days') || titleLower.includes('nibiru')) {
                    imageUrl = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80'; // Rock concert stage

                // --- ARTĂ & EXPOZIȚII ---
                } else if (cat.includes('EXPOZI') || titleLower.includes('expozi') || titleLower.includes('vernisaj') || titleLower.includes('galerie') || titleLower.includes('iriși') || titleLower.includes('irisi') || titleLower.includes('plastice') || titleLower.includes('fragments') || titleLower.includes('scrieri') || titleLower.includes('bachmann') || titleLower.includes('steaua') || titleLower.includes('lehmann')) {
                    imageUrl = 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?auto=format&fit=crop&w=800&q=80'; // Art gallery/exhibition

                // --- TEATRU & SPECTACOLE ---
                } else if (cat.includes('TEATRU') || cat.includes('SPECTACOL') || titleLower.includes('teatru') || titleLower.includes('spectacol') || titleLower.includes('soț fidel') || titleLower.includes('shakespeare') || titleLower.includes('irina brook') || titleLower.includes('scenă')) {
                    imageUrl = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'; // Theatre stage

                // --- CONCERTE & MUZICĂ LIVE ---
                } else if (cat.includes('CONCERT') || cat.includes('MUZICĂ') || cat.includes('MUZICA') || titleLower.includes('concert') || titleLower.includes('filarmonica') || titleLower.includes('recital') || titleLower.includes('vioară') || titleLower.includes('subcarpați')) {
                    imageUrl = 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80'; // Live concert

                // --- FESTIVALURI ---
                } else if (cat.includes('FESTIVAL') || titleLower.includes('festival') || titleLower.includes('zilele redutei') || titleLower.includes('oktoberfest') || titleLower.includes('zilele')) {
                    imageUrl = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80'; // Festival crowd

                // --- SPORT & COMPETIȚII ---
                } else if (cat.includes('SPORT') || titleLower.includes('sport') || titleLower.includes('cursa') || titleLower.includes('heroes') || titleLower.includes('kastel') || titleLower.includes('brasov heroes') || titleLower.includes('olimpia') || titleLower.includes('fotbal')) {
                    imageUrl = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80'; // Sport event

                // --- CARITABIL ---
                } else if (cat.includes('CARITABIL') || titleLower.includes('caritabil') || titleLower.includes('donație')) {
                    imageUrl = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80'; // Charity/community

                // --- CULTURĂ GENERALĂ (conferințe, lansări cărți, bibliotecă) ---
                } else if (cat.includes('CULTURĂ') || cat.includes('CULTURA') || titleLower.includes('aromânii') || titleLower.includes('biblioteca') || titleLower.includes('modarom') || titleLower.includes('carte') || titleLower.includes('lansare') || titleLower.includes('lectură') || titleLower.includes('muzeu')) {
                    imageUrl = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80'; // Books/library/culture

                // --- PARTY & CLUBBING ---
                } else if (cat.includes('PARTY') || titleLower.includes('party') || titleLower.includes('club') || titleLower.includes('dj')) {
                    imageUrl = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'; // Party/nightclub

                // --- FOOD & GASTRONOMY ---
                } else if (titleLower.includes('food') || titleLower.includes('gastronomie') || titleLower.includes('street food') || titleLower.includes('burger')) {
                    imageUrl = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80'; // Food festival

                // --- DEFAULT (orice altceva) ---
                } else {
                    imageUrl = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'; // Generic event Brasov
                }
            }

            let eventDate = new Date();
            eventDate.setFullYear(2026);
            let parsedTime = '19:00';

            const dateMatch = block.match(/<i class=['"]eicon-calendar['"]><\/i>\s*([^<]+)/);
            if (dateMatch) {
                const dateStr = dateMatch[1].trim();
                const parts = dateStr.match(/(\d+)\/(\d+)/);
                if (parts) {
                    const day = parseInt(parts[1], 10);
                    const month = parseInt(parts[2], 10) - 1;
                    eventDate.setMonth(month, day);
                }
            }

            const timeMatch = block.match(/<i class=['"]eicon-clock-o['"]><\/i>\s*([^<]+)/);
            if (timeMatch) {
                parsedTime = timeMatch[1].trim();
            }

            const [hours, minutes] = parsedTime.split(':').map(Number);
            eventDate.setHours(hours || 19, minutes || 0, 0, 0);

            // Filter out events older than May 18, 2026
            const minDate = new Date('2026-05-18T00:00:00.000Z');
            if (eventDate < minDate) {
                console.log(`[Events Scraper] Skipping older event: "${title}" on ${eventDate.toDateString()}`);
                continue;
            }

            const when = eventDate.toISOString();

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

        if (events.length > 0) {
            // Sort chronologically starting from May 18, 2026
            events.sort((a, b) => new Date(a.when) - new Date(b.when));
            
            // Merge promoted events AT THE TOP
            const combinedEvents = [...promotedEvents, ...events];
            
            eventsCache = combinedEvents;
            lastCacheTime = now;
            console.log(`[Events Scraper] Successfully scraped, filtered, and merged ${combinedEvents.length} events (Promoted: ${promotedEvents.length})!`);
            return combinedEvents;
        } else {
            console.warn('[Events Scraper] Scraped 0 events, using backupEvents.');
            const combinedBackup = [...promotedEvents, ...backupEvents];
            return combinedBackup;
        }
    } catch (err) {
        console.error('[Events Scraper] Scraping failed, using backupEvents. Error:', err.message);
        return backupEvents;
    }
}

// ── EVENTS ENDPOINTS FOR ANGULAR DEV SERVER ──

app.post('/api/events', async (req, res) => {
    try {
        const { title, description, category, imageUrl, when, location, link, promotedBy, plan } = req.body;
        
        // Form a premium promoted event object
        const newEvent = {
            id: 'promoted-' + Date.now(),
            title: title || 'Eveniment Fără Titlu',
            description: description || '',
            category: (category || 'EVENIMENT').toUpperCase(),
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80',
            when: when || new Date().toISOString(),
            location: location || 'Brașov',
            link: link || '',
            promotedBy: promotedBy || 'Utilizator Anonim',
            plan: (plan || 'BASIC').toUpperCase(),
            isPromoted: true // Glowing outline & badge marker
        };
        
        promotedEvents.push(newEvent);
        
        // Persist to file
        await fs.promises.writeFile(promotedEventsFile, JSON.stringify(promotedEvents, null, 2), 'utf8');
        
        // Reset the cache to merge and reflect the promoted event instantly
        eventsCache = null;
        lastCacheTime = 0;
        
        console.log(`[Promoted Events] Successfully registered promoted event: "${newEvent.title}" by ${newEvent.promotedBy} [Plan: ${newEvent.plan}]`);
        res.json({ success: true, event: newEvent });
    } catch (err) {
        console.error('[Promoted Events] Failed to register promoted event:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/events/current-week', async (req, res) => {
    try {
        const events = await getLiveEvents();
        res.json({ content: events });
    } catch (err) {
        res.json({ content: backupEvents });
    }
});

app.get('/api/events/next-week', async (req, res) => {
    try {
        const events = await getLiveEvents();
        const nextEvents = events.slice(Math.min(5, events.length));
        res.json({ content: nextEvents });
    } catch (err) {
        res.json({ content: backupEvents });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        const events = await getLiveEvents();
        const query = req.query.q ? String(req.query.q).toLowerCase() : '';
        if (query) {
            const filtered = events.filter(e => 
                e.title.toLowerCase().includes(query) || 
                e.location.toLowerCase().includes(query) ||
                e.category.toLowerCase().includes(query)
            );
            res.json({ content: filtered });
        } else {
            res.json({ content: events });
        }
    } catch (err) {
        res.json({ content: backupEvents });
    }
});

app.get('/api/v1/events', async (req, res) => {
    try {
        const events = await getLiveEvents();
        res.json(events);
    } catch (err) {
        res.json(backupEvents);
    }
});

// --- PARKING DATA ENDPOINT ---
app.get('/api/v1/parking/data', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        
        // Load HD Neighborhoods
        const nbPath = path.resolve(__dirname, '../public/brasov_neighborhoods.json');
        let neighborhoods = [];
        if (fs.existsSync(nbPath)) {
            neighborhoods = JSON.parse(fs.readFileSync(nbPath, 'utf8'));
        }

        res.json({
            zones: [
                { id: 0, name: 'Zona 0 - Centru Vechi', smsNumber: '1234', tariff: 0.60, color: '#ea4335' },
                { id: 1, name: 'Zona 1 - Centrul Civic', smsNumber: '1234', tariff: 0.40, color: '#fb8c00' },
                { id: 2, name: 'Zona 2 - Periferie', smsNumber: '1234', tariff: 0.30, color: '#34a853' }
            ],
            neighborhoods: neighborhoods
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/v1/parking/history', (req, res) => {
    res.json([
        { id: 1, plate: 'BV 01 ABC', zone: 'Sector A', amount: 12, date: '2024-05-15' },
        { id: 2, plate: 'BV 01 ABC', zone: 'Sector B', amount: 8, date: '2024-05-14' }
    ]);
});

// --- REPORTS ENDPOINTS ---
app.get('/api/v1/reports', (req, res) => {
    res.json(reports);
});

app.post('/api/v1/reports', (req, res) => {
    const newReport = {
        ...req.body,
        id: Date.now(),
        status: 'Sesizat',
        date: new Date().toISOString().split('T')[0]
    };
    reports.unshift(newReport);
    res.status(201).json(newReport);
});

// --- TRANSIT DATA ENDPOINT ---
app.get('/api/v1/transit/data', async (req, res) => {
    try {
        const dataPath = GTFS_DATA_PATH;
        
        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf8');
            res.json(JSON.parse(data));
        } else {
            // Also search inside current folder as absolute fallback if mounted locally
            const localFallbackPath = path.resolve(__dirname, 'gtfs_transit_data.json');
            if (fs.existsSync(localFallbackPath)) {
                const data = fs.readFileSync(localFallbackPath, 'utf8');
                return res.json(JSON.parse(data));
            }
            res.status(404).json({ error: 'Transit data not found inside Docker. Make sure to mount public folder or set GTFS_DATA_PATH.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- STREET PATH GENERATOR ---
function generateStreetPath(lat1, lon1, lat2, lon2, segmentsCount = 6, offsetMagnitude = 0.00035) {
    let pts = [[lon1, lat1]];
    for (let i = 1; i < segmentsCount; i++) {
        const t = i / segmentsCount;
        let lat = lat1 + (lat2 - lat1) * t;
        let lon = lon1 + (lon2 - lon1) * t;
        
        // Add alternating perpendicular offset to simulate city grid streets
        const perpLat = -(lon2 - lon1);
        const perpLon = (lat2 - lat1);
        const len = Math.sqrt(perpLat*perpLat + perpLon*perpLon);
        if (len > 0) {
            const side = (i % 2 === 0 ? 1 : -1) * offsetMagnitude * (1.0 - Math.abs(t - 0.5) * 0.5);
            lat += (perpLat / len) * side;
            lon += (perpLon / len) * side;
        }
        pts.push([lon, lat]);
    }
    pts.push([lon2, lat2]);
    return pts;
}

// --- MOCK ROUTE GENERATOR ---
function generateMockRoute(fromLat, fromLon, toLat, toLon, mode) {
    fromLat = parseFloat(fromLat);
    fromLon = parseFloat(fromLon);
    toLat = parseFloat(toLat);
    toLon = parseFloat(toLon);

    // Calculate straight-line distance in meters using Haversine
    const R = 6371e3; // metres
    const phi1 = fromLat * Math.PI/180;
    const phi2 = toLat * Math.PI/180;
    const deltaPhi = (toLat-fromLat) * Math.PI/180;
    const deltaLambda = (toLon-fromLon) * Math.PI/180;
    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceMeters = R * c;

    // Estimate durations based on mode
    let speed = 1.4; // m/s walking speed
    let totalDurationSeconds = distanceMeters / speed;
    
    let features = [];
    let now = Date.now();

    if (distanceMeters < 350) {
        // For extremely short distances, just generate a single walk leg
        features.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: generateStreetPath(fromLat, fromLon, toLat, toLon, 4, 0.00008)
            },
            properties: {
                mode: 'WALK',
                duration: Math.max(1, Math.round(distanceMeters / (1.4 * 60))),
                distance: distanceMeters,
                instructions: 'Mergi pe jos către destinație',
                color: '#4285F4',
                startTime: now
            }
        });
        totalDurationSeconds = distanceMeters / 1.4;
    } else if (mode.includes('CAR')) {
        speed = 10.0; // m/s driving
        totalDurationSeconds = distanceMeters / speed;

        features.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: generateStreetPath(fromLat, fromLon, toLat, toLon, 10, 0.00045)
            },
            properties: {
                mode: 'CAR',
                duration: Math.max(2, Math.round(totalDurationSeconds / 60)),
                distance: distanceMeters,
                instructions: 'Condu spre destinație',
                color: '#747d8c',
                startTime: now
            }
        });
    } else if (mode.includes('WALK') && !mode.includes('TRANSIT')) {
        features.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: generateStreetPath(fromLat, fromLon, toLat, toLon, 8, 0.0002)
            },
            properties: {
                mode: 'WALK',
                duration: Math.max(3, Math.round(totalDurationSeconds / 60)),
                distance: distanceMeters,
                instructions: 'Mergi pe jos către destinație',
                color: '#4285F4',
                startTime: now
            }
        });
    } else {
        // TRANSIT mode (WALK,TRANSIT)
        const walk1Dist = distanceMeters * 0.15;
        const transitDist = distanceMeters * 0.70;
        const walk2Dist = distanceMeters * 0.15;

        const walkSpeed = 1.4;
        const transitSpeed = 8.0; // m/s (30 km/h)

        const dur1 = walk1Dist / walkSpeed;
        const dur2 = transitDist / transitSpeed;
        const dur3 = walk2Dist / walkSpeed;
        
        totalDurationSeconds = dur1 + dur2 + dur3;

        const startStopLat = fromLat + (toLat - fromLat) * 0.15 + (toLon - fromLon) * 0.02;
        const startStopLon = fromLon + (toLon - fromLon) * 0.15 - (toLat - fromLat) * 0.02;

        const endStopLat = fromLat + (toLat - fromLat) * 0.85 - (toLon - fromLon) * 0.02;
        const endStopLon = fromLon + (toLon - fromLon) * 0.85 + (toLat - fromLat) * 0.02;

        // Choose a highly realistic line number and color for the destination stop name
        const busLines = [
            { name: '4', color: '#e74c3c' },
            { name: '20', color: '#2ecc71' },
            { name: '17', color: '#3498db' },
            { name: '34', color: '#9b59b6' },
            { name: '50', color: '#e67e22' }
        ];
        
        // Make the line selection deterministic based on the destination coordinates
        const line = busLines[Math.floor(Math.abs(toLat + toLon) * 100) % busLines.length];

        features.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: generateStreetPath(fromLat, fromLon, startStopLat, startStopLon, 5, 0.00015)
            },
            properties: {
                mode: 'WALK',
                duration: Math.max(1, Math.round(dur1 / 60)),
                distance: walk1Dist,
                instructions: `Walk din start spre Stația de autobuz`,
                color: '#4285F4',
                startTime: now
            }
        });

        features.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: generateStreetPath(startStopLat, startStopLon, endStopLat, endStopLon, 12, 0.00045)
            },
            properties: {
                mode: 'TRANSIT',
                duration: Math.max(2, Math.round(dur2 / 60)),
                distance: transitDist,
                instructions: `Bus ${line.name} din Stația Centrală`,
                color: line.color,
                startTime: now + dur1 * 1000
            }
        });

        features.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: generateStreetPath(endStopLat, endStopLon, toLat, toLon, 5, 0.00015)
            },
            properties: {
                mode: 'WALK',
                duration: Math.max(1, Math.round(dur3 / 60)),
                distance: walk2Dist,
                instructions: 'Walk spre destinație',
                color: '#4285F4',
                startTime: now + (dur1 + dur2) * 1000
            }
        });
    }

    return {
        type: 'FeatureCollection',
        metadata: {
            totalDurationMinutes: Math.max(1, Math.round(totalDurationSeconds / 60)),
            transfers: mode.includes('TRANSIT') && distanceMeters >= 350 ? 1 : 0,
            distance: Math.round(distanceMeters),
            startTime: now,
            endTime: now + totalDurationSeconds * 1000
        },
        features: features
    };
}

// --- ROUTING ENDPOINT ---
app.post('/api/v1/routing/plan', async (req, res) => {
    const { fromLat, fromLon, toLat, toLon, mode } = req.body;
    const otpMode = mode || 'WALK,TRANSIT';
    
    try {
        console.log(`[Proxy] Routing (${otpMode}): ${fromLat},${fromLon} -> ${toLat},${toLon}`);

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const pad = (n) => String(n).padStart(2, '0');
        const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        
        const otpUrl = `${OTP_BASE_URL}/plan`;
        
        let response;
        try {
            response = await axios.get(otpUrl, {
                params: {
                    fromPlace: `${fromLat},${fromLon}`,
                    toPlace: `${toLat},${toLon}`,
                    mode: otpMode,
                    date: dateStr,
                    time: timeStr,
                    numItineraries: 10,
                    maxWalkDistance: 2000
                },
                timeout: 3000 // 3 seconds timeout
            });
        } catch (axiosErr) {
            console.warn(`[Proxy] OTP Server unreachable or timed out. Falling back to Mock routing! Reason: ${axiosErr.message}`);
            const mockData = generateMockRoute(fromLat, fromLon, toLat, toLon, otpMode);
            return res.json(mockData);
        }

        let routeData = response.data;

        // Find itineraries that actually HAVE transit
        let transitItineraries = [];
        if (routeData.plan && routeData.plan.itineraries) {
            transitItineraries = routeData.plan.itineraries.filter(it => it.legs.some(leg => leg.mode !== 'WALK'));
        }

        // If no routes at all, OR if transit was requested but only walk routes were found (late hours/night time)
        const needsFallback = !routeData.plan || 
                              !routeData.plan.itineraries || 
                              !routeData.plan.itineraries.length ||
                              (otpMode.includes('TRANSIT') && transitItineraries.length === 0);

        if (needsFallback) {
            console.log(`[Proxy] No active transit routes found for tonight. Trying tomorrow morning at 07:00 AM...`);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
            const tomorrowTimeStr = "07:00";
            
            try {
                const fallbackResponse = await axios.get(otpUrl, {
                    params: {
                        fromPlace: `${fromLat},${fromLon}`,
                        toPlace: `${toLat},${toLon}`,
                        mode: otpMode,
                        date: tomorrowDateStr,
                        time: tomorrowTimeStr,
                        numItineraries: 10,
                        maxWalkDistance: 2000
                    },
                    timeout: 3000
                });
                
                if (fallbackResponse.data.plan && fallbackResponse.data.plan.itineraries && fallbackResponse.data.plan.itineraries.length) {
                    // Update transit itineraries count for tomorrow
                    const fallbackTransit = fallbackResponse.data.plan.itineraries.filter(it => it.legs.some(leg => leg.mode !== 'WALK'));
                    
                    if (fallbackTransit.length > 0 || fallbackResponse.data.plan.itineraries.length > 0) {
                        console.log(`[Proxy] Successfully found fallback itineraries for tomorrow morning!`);
                        routeData = fallbackResponse.data;
                        transitItineraries = fallbackTransit;
                    } else {
                        console.warn(`[Proxy] No itineraries found even for tomorrow morning. Falling back to Mock routing!`);
                        const mockData = generateMockRoute(fromLat, fromLon, toLat, toLon, otpMode);
                        return res.json(mockData);
                    }
                } else {
                    console.warn(`[Proxy] No itineraries found even for tomorrow. Falling back to Mock routing!`);
                    const mockData = generateMockRoute(fromLat, fromLon, toLat, toLon, otpMode);
                    return res.json(mockData);
                }
            } catch (err) {
                console.error('[Proxy] Fallback routing query failed:', err.message);
                console.warn(`[Proxy] Falling back to Mock routing due to exception!`);
                const mockData = generateMockRoute(fromLat, fromLon, toLat, toLon, otpMode);
                return res.json(mockData);
            }
        }
        
        let itinerary;
        if (transitItineraries.length > 0) {
            // Sort by number of legs (fewer legs = fewer transfers/bus switches)
            transitItineraries.sort((a, b) => a.legs.length - b.legs.length);
            itinerary = transitItineraries[0];
        } else {
            itinerary = routeData.plan.itineraries[0];
        }
        
        const features = itinerary.legs.map(leg => ({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: decodePolyline(leg.legGeometry.points)
            },
            properties: {
                mode: leg.mode,
                duration: Math.round(leg.duration / 60),
                distance: leg.distance,
                instructions: leg.mode === 'WALK' ? 'Walk' : (leg.mode === 'CAR' ? 'Drive' : `Bus ${leg.routeShortName} din ${leg.from.name}`),
                color: leg.mode === 'WALK' ? '#4285F4' : (leg.mode === 'CAR' ? '#747d8c' : (leg.routeColor ? `#${leg.routeColor}` : '#1a1a1a')),
                startTime: leg.startTime
            }
        }));

        res.json({
            type: 'FeatureCollection',
            metadata: {
                totalDurationMinutes: Math.round(itinerary.duration / 60),
                transfers: itinerary.transfers,
                distance: itinerary.legs.reduce((acc, leg) => acc + leg.distance, 0),
                startTime: itinerary.startTime,
                endTime: itinerary.endTime
            },
            features: features
        });

    } catch (err) {
        console.error('[Proxy] Catch-all routing error:', err.message);
        console.warn(`[Proxy] Catch-all fallback. Generating Mock route!`);
        const mockData = generateMockRoute(fromLat, fromLon, toLat, toLon, otpMode);
        res.json(mockData);
    }
});

function decodePolyline(str) {
    let index = 0, lat = 0, lng = 0, coordinates = [];
    while (index < str.length) {
        let b, shift = 0, result = 0;
        do {
            b = str.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        lat += ((result & 1) ? ~(result >> 1) : (result >> 1));
        shift = 0;
        result = 0;
        do {
            b = str.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        lng += ((result & 1) ? ~(result >> 1) : (result >> 1));
        coordinates.push([lng / 100000, lat / 100000]);
    }
    return coordinates;
}

app.listen(8081, () => console.log('🚀 PWA Bridge running on http://localhost:8081'));
