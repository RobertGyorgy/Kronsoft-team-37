const fs = require('fs');
const { parse } = require('csv-parse/sync');

console.log('🚀 Processing GTFS Feed...');

const gtfsDir = './scratch/gtfs';

// Helper to read and parse CSV
const readCsv = (filename) => {
    const content = fs.readFileSync(`${gtfsDir}/${filename}`, 'utf-8');
    return parse(content, { columns: true, skip_empty_lines: true, trim: true });
};

// Ensure directory exists
if (!fs.existsSync(gtfsDir)) {
    console.error(`❌ Error: GTFS directory not found at ${gtfsDir}. Please download and unzip the feed first.`);
    process.exit(1);
}

const routesRaw = readCsv('routes.txt');
const stopsRaw = readCsv('stops.txt');
const tripsRaw = readCsv('trips.txt');
const stopTimesRaw = readCsv('stop_times.txt');

// 1. Build Routes Map
const routes = {};
routesRaw.forEach(r => {
    routes[r.route_id] = {
        name: r.route_short_name,
        longName: r.route_long_name,
        color: r.route_color || 'ff4500',
        textColor: r.route_text_color || 'ffffff'
    };
});

// 2. Build Trips Map
const trips = {};
tripsRaw.forEach(t => {
    trips[t.trip_id] = {
        routeId: t.route_id,
        serviceId: t.service_id,
        directionId: t.direction_id || '0',
        headsign: t.trip_headsign || ''
    };
});

// 3. Build Stops Map
const stops = {};
stopsRaw.forEach(s => {
    if (s.location_type === '1') return; // Skip parent stations for the raw mapping, we want platforms

    stops[s.stop_id] = {
        id: s.stop_id,
        name: s.stop_name.replace(/"/g, '').trim(),
        lat: parseFloat(s.stop_lat),
        lon: parseFloat(s.stop_lon),
        parent: s.parent_station,
        lines: {} 
    };
});

// 4. Process Stop Times
let processedCount = 0;
stopTimesRaw.forEach(st => {
    const stop = stops[st.stop_id];
    if (!stop) return; 

    const trip = trips[st.trip_id];
    if (!trip) return;

    const route = routes[trip.routeId];
    if (!route) return;

    const timeStr = st.departure_time.substring(0, 5); // "HH:mm"
    
    const target = trip.headsign || route.longName.split('-').pop().trim();
    const lineKey = `${route.name}_${trip.directionId}`;

    if (!stop.lines[lineKey]) {
        stop.lines[lineKey] = {
            name: route.name,
            color: '#' + route.color,
            textColor: '#' + route.textColor,
            target: target,
            timetable: {}
        };
    }

    if (!stop.lines[lineKey].timetable[trip.serviceId]) {
        stop.lines[lineKey].timetable[trip.serviceId] = new Set();
    }

    stop.lines[lineKey].timetable[trip.serviceId].add(timeStr);
    processedCount++;
});

// 5. Clean up and format output
const finalPlatforms = [];

Object.values(stops).forEach(stop => {
    if (Object.keys(stop.lines).length === 0) return;

    // Convert Sets to sorted arrays
    Object.keys(stop.lines).forEach(lineKey => {
        const line = stop.lines[lineKey];
        Object.keys(line.timetable).forEach(serviceId => {
            line.timetable[serviceId] = Array.from(line.timetable[serviceId]).sort();
        });
    });

    // Generate descriptive displayName
    const targets = [...new Set(Object.values(stop.lines).map(l => l.target))]
        .filter(t => !t.toLowerCase().includes(stop.name.toLowerCase()));
    
    let displayName = stop.name;
    if (targets.length > 0) {
        const targetStr = targets.slice(0, 2).join(', ');
        displayName = `${stop.name} (spre ${targetStr})`;
    }

    finalPlatforms.push({
        id: stop.id,
        name: stop.name,
        displayName: displayName,
        parent: stop.parent,
        lat: stop.lat,
        lon: stop.lon,
        lines: stop.lines
    });
});

fs.writeFileSync('./public/gtfs_transit_data.json', JSON.stringify(finalPlatforms, null, 2));

console.log(`✨ SUCCESS! Created ${finalPlatforms.length} platforms from ${processedCount} stop times.`);
