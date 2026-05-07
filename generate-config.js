const fs = require('fs');
const path = require('path');

// This script generates public/config.json from environment variables during the build process.
// It is used for secure deployments on Vercel/Netlify.

const config = {
    GOOGLE_MAPS_API_KEY: process.env.NG_APP_GOOGLE_MAPS_API_KEY || ''
};

const configPath = path.join(__dirname, 'public', 'config.json');

// Ensure the public directory exists
if (!fs.existsSync(path.join(__dirname, 'public'))) {
    fs.mkdirSync(path.join(__dirname, 'public'));
}

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('✅ public/config.json generated successfully from environment variables.');
