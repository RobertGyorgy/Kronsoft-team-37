const fs = require('fs');
const path = require('path');

/**
 * Reads .env file and extracts key-value pairs.
 * Avoids any external dependencies to keep the proxy setup lightweight.
 */
function readEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  .env file not found. Falling back to process.env and default localhost.');
    return {};
  }

  const env = {};
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return; // skip comments and empty lines
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
  } catch (error) {
    console.error('❌ Failed to read .env file:', error);
  }
  return env;
}

const envVars = { ...process.env, ...readEnv() };

// BACKEND_URL in .env is something like 192.168.30.50 or localhost.
// Let's resolve the host and optional protocol from the env variable.
const rawBackendUrl = envVars.BACKEND_URL || 'localhost';

let host = rawBackendUrl;
let protocol = 'http';

// Handle cases where BACKEND_URL might contain a protocol (e.g. http://192.168.30.50)
if (rawBackendUrl.includes('://')) {
  const parts = rawBackendUrl.split('://');
  protocol = parts[0];
  host = parts[1];
}

// Ensure host does not have trailing slashes
host = host.replace(/\/+$/, '');

const backend8083 = `${protocol}://${host}:8083`;
const backend8081 = `${protocol}://${host}:8081`;

console.log(`🌐 Proxy targets configured dynamically:`);
console.log(`   - Main Backend APIs (8083): ${backend8083}`);
console.log(`   - Bridge (8081) — events, /api/v1: ${backend8081}\n`);

const PROXY_CONFIG = {
  "/api/auth": {
    "target": backend8083,
    "secure": false
  },
  "/api/user": {
    "target": backend8083,
    "secure": false
  },
  "/api/users": {
    "target": backend8083,
    "secure": false
  },
  "/api/reports": {
    "target": backend8083,
    "secure": false
  },
  "/api/report-categories": {
    "target": backend8083,
    "secure": false
  },
  "/api/events": {
    "target": backend8081,
    "secure": false
  },
  "/api/app-events": {
    "target": backend8083,
    "pathRewrite": {
      "^/api/app-events": "/api/events"
    },
    "secure": false
  },
  "/api/parking": {
    "target": backend8083,
    "secure": false
  },
  "/api/recommendations": {
    "target": backend8083,
    "secure": false
  },
  "/api/recommendation": {
    "target": backend8083,
    "secure": false
  },
  "/api/notifications": {
    "target": backend8083,
    "secure": false
  },
  "/api/images": {
    "target": backend8083,
    "secure": false
  },
  "/api/v1": {
    "target": backend8081,
    "secure": false
  }
};

module.exports = PROXY_CONFIG;
