# Weekend Recommendations - Location Integration Guide

## Overview
Weekend recommendations now include location buttons that redirect users to the Transport page with destination coordinates pre-filled, enabling route calculation via OTP (OpenTripPlanner).

---

## Implementation Details

### 1. **Frontend Changes (Angular)**

#### Updated Recommendation Interface
```typescript
interface Recommendation {
  id?: string;
  name: string;
  title?: string;
  description?: string;
  text?: string;
  tip?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  link?: string;
}
```

#### Location Button in Template
Each recommendation card now displays:
- **"RUTĂ" button** - Redirects to Transport with coordinates (when available)
- **"MAPS" button** - Opens Google Maps for the location
- **Address display** - Shows full address with location icon

#### Navigation Method
```typescript
goToLocation(rec: Recommendation) {
  if (!rec.coordinates || !rec.address) {
    alert('Coordonate indisponibile pentru această locație.');
    return;
  }
  const { lat, lng } = rec.coordinates;
  this.router.navigate(['/transport/bus/search'], {
    queryParams: {
      destination: rec.address,
      lat,
      lng,
      name: rec.name || rec.title
    }
  });
}
```

### 2. **GeminiService Updates**

The service now extracts location data from decision_tree.json:

```typescript
const placesList = result.recommendations.map((placeId: string) => {
  const place = catTree.places[placeId];
  if (place) {
    return {
      id: place.id,
      name: place.name,
      description: place.description || place.shortDescription,
      tip: place.tip,
      address: place.address,
      coordinates: place.coordinates
    };
  }
  return null;
}).filter((p: any) => p !== null);
```

### 3. **JSON Structure Requirements**

Every place in decision_tree.json must include:

```json
{
  "id": "unique_id",
  "name": "Location Name",
  "description": "Full description",
  "shortDescription": "Short version",
  "address": "Street address",
  "coordinates": {
    "lat": 45.6420,
    "lng": 25.5890
  },
  "cuisine": "Type",
  "priceRange": "Budget range",
  "tip": "Practical tip",
  "tags": ["tag1", "tag2"],
  "hours": "Opening hours",
  "image": "image.jpg"
}
```

**Example (Restaurante):**
```json
"sergiana_mureseni": {
  "id": "sergiana_mureseni",
  "name": "Sergiana Mureșenilor",
  "address": "Str. Mureșenilor nr. 28, Brașov",
  "coordinates": { "lat": 45.6420, "lng": 25.5890 },
  ...
}
```

---

## Groq AI Prompt (For Non-Local Categories)

When a category uses Groq API fallback (Natura, Artă, Cafenele, Plimbări, Experiențe), use this system prompt:

### System Prompt
```
Ești un local din Brașov care știe orașul pe dinăuntru și pe dinafară.
Vorbești în română, prietenos, ca și cum ai da sfaturi unui prieten.

## Ce faci:
Primești parametrii de preferință și generezi 3 recomandări reale și verificabile 
din Brașov cu locații exacte și coordonate GPS.

## Reguli stricte:
1. Scrii DOAR în română.
2. Fiecare recomandare: 2-3 propoziții maximum - ton de local prieten.
3. NU inventa informații. Doar locații reale din Brașov.
4. Include coordonate GPS reale și adresă precisă.
5. Răspuns: JSON valid cu structura de mai jos.

## Format Output (JSON strict):
{
  "recommendations": [
    {
      "id": "unique_id",
      "name": "Exact Location Name",
      "address": "Full street address",
      "coordinates": { "lat": 45.XXXX, "lng": 25.XXXX },
      "text": "2-3 propoziții tip local"
    }
  ]
}

**Important:** Coordonate și adrese trebuie să fie reale și verificabile pe Google Maps!
```

### Example User Prompt (For Natura Category)
```
Categoria: Natură
Răspunsuri utilizator: Activ (drumeții, ciclism) / Cuplu / Jumătate de zi

Generează 3 recomandări de locuri din Brașov pentru această categorie.
Include coordonate GPS reale și adresă completă pentru fiecare locație.
```

### Example Response
```json
{
  "recommendations": [
    {
      "id": "piatra_mare_trail",
      "name": "Piatra Mare - Drumeția Alpina",
      "address": "Piatra Mare Trail, Brașov",
      "coordinates": { "lat": 45.6250, "lng": 25.4850 },
      "text": "Cea mai populară traseu de drumeție din zonă - perfect pentru cupluri care vor o jumătate de zi activi. Piscurile panoramice și pădurile de molid te vor bloca respirația."
    },
    {
      "id": "bârsa_valley_cycling",
      "name": "Bârsa Valley Cycling Route",
      "address": "Bârsa Valley, Comuna Micești, Brașov",
      "coordinates": { "lat": 45.5800, "lng": 25.5200 },
      "text": "Traseu ciclist spectaculos prin vale cu ape cristaline. 4-5 ore pe bicicletă - ideal pentru cupluri cu energie și vrea o zi memorabilă."
    }
  ]
}
```

---

## Transport Page Integration (Bus-Search Component)

The bus-search component can now read destination parameters from query string:

### Reading Query Params
```typescript
// In bus-search.component.ts
private route = inject(ActivatedRoute);

ngOnInit() {
  this.route.queryParams.pipe(
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(params => {
    if (params['destination']) {
      const destination = params['destination'];
      const lat = parseFloat(params['lat']);
      const lng = parseFloat(params['lng']);
      const name = params['name'];
      
      // Set destination in search or auto-select marker on map
      this.searchTerm.set(destination);
      this.setDestinationMarker(lat, lng);
    }
  });
}
```

### Setting Destination Marker on Map
```typescript
private setDestinationMarker(lat: number, lng: number) {
  if (!this.map) return;
  
  // Remove old destination marker if exists
  if (this.destinationMarker) {
    this.destinationMarker.remove();
  }
  
  // Add new destination marker
  this.destinationMarker = new maplibregl.Marker({ 
    color: '#ff4500' 
  })
    .setLngLat([lng, lat])
    .addTo(this.map);
  
  // Center map on destination
  this.map.flyTo({ center: [lng, lat], zoom: 15 });
}
```

---

## OTP Integration (Route Calculation)

### OpenTripPlanner API Endpoint
```
GET /otp/routers/default/plan
?fromPlace={lat},{lng}
&toPlace={dest_lat},{dest_lng}
&date=YYYYMMDD
&time=HH:mm:ss
&mode=WALK,TRANSIT
```

### Implementation in Bus-Program Component
```typescript
async calculateRoute(origin: {lat: number, lng: number}, destination: {lat: number, lng: number}) {
  const now = new Date();
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const time = now.toTimeString().split(' ')[0];
  
  const url = `https://otp.brasov.local/otp/routers/default/plan?` +
    `fromPlace=${origin.lat},${origin.lng}&` +
    `toPlace=${destination.lat},${destination.lng}&` +
    `date=${date}&time=${time}&mode=WALK,TRANSIT`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.plan && data.plan.itineraries) {
      // Display itineraries on map
      this.displayItineraries(data.plan.itineraries);
    }
  } catch (error) {
    console.error('OTP Error:', error);
  }
}

private displayItineraries(itineraries: any[]) {
  // Sort by duration
  itineraries.sort((a, b) => a.duration - b.duration);
  
  // Show first 3 routes as options to user
  itineraries.slice(0, 3).forEach((itinerary, index) => {
    const legs = itinerary.legs.map(leg => ({
      mode: leg.mode, // WALK, BUS, TRAM, etc.
      route: leg.route,
      duration: leg.duration,
      startTime: new Date(leg.startTime),
      endTime: new Date(leg.endTime)
    }));
    
    console.log(`Route ${index + 1}:`, {
      duration: itinerary.duration,
      transfers: itinerary.transfers,
      legs: legs
    });
  });
}
```

---

## Flow Diagram

```
User completes Weekend Quiz
        ↓
GeminiService fetches recommendations with coordinates
        ↓
Results displayed with location buttons
        ↓
User clicks "RUTĂ" button
        ↓
Navigate to /transport/bus/search with query params:
  - destination (street address)
  - lat, lng (coordinates)
  - name (location name)
        ↓
Bus-search component receives params
        ↓
Sets destination marker on map
        ↓
User can select transportation mode
        ↓
OTP API calculates optimal route
        ↓
Routes displayed on map with timing info
```

---

## Testing Checklist

- [ ] Restaurante category shows coordinates and location buttons
- [ ] Clicking "RUTĂ" navigates to transport with pre-filled destination
- [ ] Transport map displays destination marker
- [ ] OTP route calculation works (if OTP enabled)
- [ ] "MAPS" button opens Google Maps correctly
- [ ] Address is displayed under location name
- [ ] Responsive design on mobile (location buttons stack properly)
- [ ] Query params are properly URL-encoded
- [ ] No console errors on navigation

---

## Files Modified

1. `src/app/features/weekend/pages/weekend/weekend.component.ts`
   - Added location button UI
   - Added `goToLocation()` method
   - Updated Recommendation interface
   - Added styling for location elements

2. `src/app/core/services/gemini.service.ts`
   - Updated place extraction to include coordinates and address
   - Passes location data to recommendations

3. `public/decision_tree.json`
   - Restaurante category includes full coordinates for all 32 locations
   - Structure supports coordinates for other categories when added

---

## Future Enhancements

1. **Add Natura, Artă categories to decision_tree.json** with coordinates
2. **Implement OTP integration** for live route planning
3. **Add transit mode selection** (bus, walk, bike, car)
4. **Store frequently used destinations** in user preferences
5. **Add estimated arrival time** (ETA) predictions
6. **Enable offline routing** with offline map tiles

---

## Environment Variables

Ensure config.json includes OTP endpoint:
```json
{
  "GROQ_API_KEY": "your_key_here",
  "OTP_URL": "https://otp.brasov.local/otp",
  "MAP_STYLE": "https://api.maplibre.org/v0/styles/osm-bright/style.json"
}
```

---

## Questions?

Contact: This system is designed for the SmartCity Brașov PWA project.
