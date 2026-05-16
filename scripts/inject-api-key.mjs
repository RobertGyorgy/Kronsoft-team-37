import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Citire .env (fără dependențe externe) ──────────────────────
function readEnv() {
    const envPath = path.resolve(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
        console.warn('⚠️  Fișierul .env nu există. Creează unul pe baza .env.example');
        return {};
    }

    const env = {};
    fs.readFileSync(envPath, 'utf8')
        .split('\n')
        .forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;       // skip comments
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length) {
                env[key.trim()] = valueParts.join('=').trim();
            }
        });
    return env;
}

const envVars = { ...process.env, ...readEnv() };

// ── 1. Google Maps → index.html ────────────────────────────────
const indexPath = path.resolve(__dirname, '../src/index.html');
const mapsKey = envVars['GOOGLE_MAPS_API_KEY'];

if (mapsKey && fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    html = html.replace(/key=[^&"']+/, `key=${mapsKey}`);
    fs.writeFileSync(indexPath, html);
    console.log('✅ Google Maps API Key → index.html');
}

// ── 2. Config JSON → public/config.json ────────────────────────
const configPath = path.resolve(__dirname, '../public/config.json');
const config = {
    GOOGLE_MAPS_API_KEY: envVars['GOOGLE_MAPS_API_KEY'] || ''
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('✅ public/config.json actualizat (Keys secured)');
