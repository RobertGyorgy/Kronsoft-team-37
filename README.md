# Brașov Smart City PWA

O aplicație modernă, de înaltă fidelitate, dedicată cetățenilor și turiștilor din Brașov, oferind soluții inteligente pentru transport, parcare și evenimente locale.

## 🚀 Tehnologii Utilizate

- **Frontend**: Angular 21 (Signals, Standalone Components, OnPush Strategy)
- **Design & Animații**: GSAP (GreenSock Animation Platform) pentru tranziții premium și micro-interacțiuni.
- **Backend Bridge**: Node.js (Express) - Acționează ca un proxy inteligent și strat de persistență pentru datele orașului.
- **Routing Engine**: Java OpenTripPlanner (OTP) - Calculează rute complexe de transport în comun.
- **Maps**: MapLibre GL & Google Maps API.
- **AI**: Integrare Groq AI pentru planificator de weekend personalizat.

## 🏛️ Arhitectură Sistem

Aplicația este integrată cu ecosistemul de producție al orașului:

1. **Frontend (Port 4200)**: Aplicație Angular 21 de înaltă performanță.
2. **Production Java Backend (Port 8083)**: Sursă oficială pentru Auth, Rapoarte, Evenimente și Parcare.
3. **PWA Bridge (Port 8081)**: Strat intermediar pentru servicii specializate:
    - **Generative AI**: Interfață securizată către Groq.
    - **Transit Engine**: Proxy către motorul Java OpenTripPlanner (Port 8080).
    - **Geofencing Data**: Servește poligoanele cartierelor pentru detectarea zonelor de parcare.

## 📡 Listă Entrypoints API (Production)

| Serviciu | Endpoint | Sursă |
| :--- | :--- | :--- |
| **Auth** | `/api/auth/*` | Java 8083 |
| **Reports** | `/api/reports`, `/api/report-categories` | Java 8083 |
| **Events** | `/api/events/current-week` | Java 8083 |
| **Parking** | `/api/parking/zones` | Java 8083 |
| **Routing** | `/api/v1/routing/plan` | Bridge 8081 |
| **AI** | `/api/v1/ai/recommendation` | Bridge 8081 |

## 🛠️ Instalare și Pornire

### 1. Configurare Mediu
Creați un fișier `.env` în rădăcina proiectului:
```env
GOOGLE_MAPS_API_KEY=cheia_ta_aici
GROQ_API_KEY=cheia_ta_aici
```

### 2. Pornire Backend Bridge
```bash
cd java-otp-backend
node pwa-bridge.js
```

### 3. Pornire Frontend
```bash
npm install
npm run start
```

## 🧹 Audit și Curățenie Cod
Codebase-ul a fost optimizat pentru performanță:
- Logică redundantă eliminată din `TransitService`.
- Naming standardizat pentru toate componentele și serviciile.
- Assets nefolosite șterse pentru a reduce dimensiunea bundle-ului.
- Migrare de la date hardcodate la fluxuri de date asincrone din backend.
