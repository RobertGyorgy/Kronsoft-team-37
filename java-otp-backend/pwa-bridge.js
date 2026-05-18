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
        const timeStr = `${now.getHours()}:${now.getMinutes()}`;
        
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

        if (!routeData.plan || !routeData.plan.itineraries || !routeData.plan.itineraries.length) {
            console.log(`[Proxy] No active routes found for tonight. Trying tomorrow morning at 07:00 AM...`);
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
                    console.log(`[Proxy] Successfully found fallback itineraries for tomorrow morning!`);
                    routeData = fallbackResponse.data;
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

        // Find itineraries that actually HAVE transit
        let transitItineraries = routeData.plan.itineraries.filter(it => it.legs.some(leg => leg.mode !== 'WALK'));
        
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
