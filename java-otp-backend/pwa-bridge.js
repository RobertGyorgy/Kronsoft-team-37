const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

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

// --- EVENTS ENDPOINT ---
let demoEvents = [
    {
        id: 1,
        title: "Concert Subcarpați - Turneu 'Valea Voltului'",
        description: "Vino să simți vibrația autentică a folclorului underground într-un concert exploziv la Kruhnen Musik Halle.",
        date: "15 MAI",
        time: "20:00",
        location: "Kruhnen Musik Halle",
        image: "https://zilesinopti.ro/wp-content/uploads/2024/03/Subcarpati-Valea-Voltului.jpg",
        category: "CONCERT",
        price: "120 RON",
        link: "https://www.iabilet.ro/bilete-brasov-subcarpati-valea-voltului-95431/"
    },
    {
        id: 2,
        title: "Street Food Festival Brașov",
        description: "Arome din toată lumea, burgeri artizanali, tacos și delicii asiatice.",
        date: "22 MAI",
        time: "11:00",
        location: "Parcul Nicolae Titulescu",
        image: "https://zilesinopti.ro/wp-content/uploads/2024/05/Street-Food-Brasov.jpg",
        category: "FESTIVAL",
        link: "https://streetfoodfestival.ro"
    }
];

app.get('/api/v1/events', (req, res) => {
    res.json(demoEvents);
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
        // Try to load from the root of the project or current folder
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.resolve(__dirname, '../public/gtfs_transit_data.json');
        
        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.status(404).json({ error: 'Transit data not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ROUTING ENDPOINT ---
app.post('/api/v1/routing/plan', async (req, res) => {
    try {
        const { fromLat, fromLon, toLat, toLon, mode } = req.body;
        
        // Default to WALK,TRANSIT if not specified
        const otpMode = mode || 'WALK,TRANSIT';
        
        console.log(`[Proxy] Routing (${otpMode}): ${fromLat},${fromLon} -> ${toLat},${toLon}`);

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = `${now.getHours()}:${now.getMinutes()}`;
        
        const otpUrl = `http://localhost:8080/otp/routers/default/plan`;
        const response = await axios.get(otpUrl, {
            params: {
                fromPlace: `${fromLat},${fromLon}`,
                toPlace: `${toLat},${toLon}`,
                mode: otpMode,
                date: dateStr,
                time: timeStr,
                numItineraries: 10,
                maxWalkDistance: 2000
            }
        });

        if (!response.data.plan || !response.data.plan.itineraries.length) {
            return res.status(404).json({ error: 'No route found' });
        }

        // Find itineraries that actually HAVE transit
        let transitItineraries = response.data.plan.itineraries.filter(it => it.legs.some(leg => leg.mode !== 'WALK'));
        
        let itinerary;
        if (transitItineraries.length > 0) {
            // Sort by number of legs (fewer legs = fewer transfers/bus switches)
            transitItineraries.sort((a, b) => a.legs.length - b.legs.length);
            itinerary = transitItineraries[0];
        } else {
            itinerary = response.data.plan.itineraries[0];
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
        console.error('[Proxy] Error:', err.message);
        res.status(500).json({ error: err.message });
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
