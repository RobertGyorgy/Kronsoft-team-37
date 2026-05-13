# Brașov Smart Routing Engine (OTP + Node Bridge)

This repository contains the core routing intelligence for the Brașov Smart City PWA. It uses **OpenTripPlanner (OTP)** for complex transit calculations and a **Node.js Bridge** to simplify data for the frontend.

## 🏗 Architecture
The system works in three layers:
1.  **Core (Java OTP)**: Processes the `brasov.pbf` (Map) and `ratbv-gtfs.zip` (Schedules).
2.  **Bridge (Node.js)**: Proxies requests to OTP and transforms the response into clean **GeoJSON**.
3.  **Frontend (Angular)**: Displays the GeoJSON on MapLibre and renders the timeline.

## 🚀 Integration with Frontend

### 1. The API Endpoint
The frontend sends a simple POST request to:
`POST http://localhost:4200/api/v1/routing/plan`

**Payload:**
```json
{
  "fromLat": 45.6483,
  "fromLon": 25.5891,
  "toLat": 45.6600,
  "toLon": 25.6100,
  "mode": "WALK,TRANSIT"
}
```

### 2. Angular Proxy (`proxy.conf.json`)
The frontend uses an Angular proxy to redirect `/api` calls to the Node bridge (running on port 8081):
```json
{
  "/api/v1/routing": {
    "target": "http://localhost:8081",
    "secure": false
  }
}
```

### 3. Data Handling
The Bridge returns a **FeatureCollection**. In the Angular component, we map these features to a `steps` array:
- `f.properties.mode === 'WALK'` -> Rendered as **Dotted Line**.
- `f.properties.mode === 'BUS'` -> Rendered as **Solid Line** with route color.
- `f.properties.startTime` -> Displayed as **Boarding Time**.

## 🛠 Setup & Running

### 1. Download Large Binaries
Since `otp.jar` and `brasov.pbf` are too large for GitHub (>500MB total), run the included setup script to fetch them:
```bash
chmod +x setup-engine.sh
./setup-engine.sh
```

### 2. Start the Engine (OTP)
Once the files are downloaded, build the graph and start the server:
```bash
cd otp-config
java -Xmx4G -jar otp.jar --build --serve .
```

### 3. Start the Bridge
In a separate terminal, start the Node.js translator:
```bash
node pwa-bridge.js
```

## 🧠 Routing Logic
The rules are defined in `otp-config/router-config.json`. We use "Transit-Aggressive" settings:
- `walkReluctance`: 20.0 (Walking is expensive)
- `waitReluctance`: 0.1 (Waiting is cheap)
- `maxWalkDistance`: 2000m (Large search radius)
