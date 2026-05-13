import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to read .env file manually without external deps
function readEnv() {
    const envPath = path.resolve(__dirname, '../.env');
    if (!fs.existsSync(envPath)) return {};
    
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.join('=').trim();
        }
    });
    return env;
}

const envVars = { ...process.env, ...readEnv() };

// 1. Inject Google Maps into index.html
const indexPath = path.resolve(__dirname, '../src/index.html');
const mapsKey = envVars['GOOGLE_MAPS_API_KEY'];

if (mapsKey && fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    const regex = /key=[^&"']+/;
    const newHtml = html.replace(regex, `key=${mapsKey}`);
    fs.writeFileSync(indexPath, newHtml);
    console.log('✅ Google Maps API Key injected into index.html');
}

// 2. Update public/config.json for Groq and other keys
const configPath = path.resolve(__dirname, '../public/config.json');
const config = {
    GOOGLE_MAPS_API_KEY: envVars['GOOGLE_MAPS_API_KEY'] || '',
    GROQ_API_KEY: envVars['GROQ_API_KEY'] || ''
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('✅ public/config.json updated from .env');
