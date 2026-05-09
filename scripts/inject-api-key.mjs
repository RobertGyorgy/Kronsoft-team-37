import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the index.html file
const indexPath = path.resolve(__dirname, '../src/index.html');

// Priority: 
// 1. Process Environment Variable (Vercel/CI)
// 2. config.json (Local fallback)
// 3. Hardcoded fallback (for convenience in dev)
let apiKey = process.env['GOOGLE_MAPS_API_KEY'];

if (!apiKey) {
    try {
        const configPath = path.resolve(__dirname, '../public/config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        apiKey = config.googleMapsApiKey;
    } catch (e) {
        console.warn('⚠️ No API Key found in environment or config.json');
    }
}

if (apiKey) {
    let html = fs.readFileSync(indexPath, 'utf8');
    
    // Replace the placeholder or the previous key
    const regex = /key=[^&"']+/;
    const newHtml = html.replace(regex, `key=${apiKey}`);
    
    fs.writeFileSync(indexPath, newHtml);
    console.log('✅ Google Maps API Key injected successfully into index.html');
} else {
    console.error('❌ Failed to inject Google Maps API Key: No key found.');
}
