const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

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
