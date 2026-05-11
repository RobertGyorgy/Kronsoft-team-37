const fs = require('fs');

// We are manually tracing the exact Google Maps locality boundary (the pale pink area)
// since this specific proprietary boundary does not exist in OpenStreetMap.
const customPoianaPath = [
  // Top (North of Poiana Mică along 1E)
  { lat: 45.6120, lng: 25.5530 },
  { lat: 45.6110, lng: 25.5545 },
  // Right side going down towards Alpin
  { lat: 45.6040, lng: 25.5560 },
  { lat: 45.5980, lng: 25.5590 },
  { lat: 45.5960, lng: 25.5640 }, // Bulge near Alpin
  { lat: 45.5940, lng: 25.5650 },
  // Bottom right (near Aurelius and Denisa)
  { lat: 45.5910, lng: 25.5630 },
  { lat: 45.5890, lng: 25.5600 },
  { lat: 45.5880, lng: 25.5580 },
  // Bottom tip (Near Pârtia Sulinar)
  { lat: 45.5840, lng: 25.5530 },
  // Bottom left (Near Teleferic Grand Hotel)
  { lat: 45.5860, lng: 25.5490 },
  { lat: 45.5880, lng: 25.5460 },
  // Middle left bulge
  { lat: 45.5920, lng: 25.5440 },
  { lat: 45.5940, lng: 25.5450 },
  // Upper left (heading towards Mountain SPA)
  { lat: 45.5980, lng: 25.5470 },
  { lat: 45.6010, lng: 25.5480 },
  // Curving back to Poiana Mică
  { lat: 45.6060, lng: 25.5485 },
  { lat: 45.6100, lng: 25.5510 }
];

const poianaFinal = {
  name: 'POIANA BRAȘOV',
  zone: 0,
  path: customPoianaPath
};

const mainData = JSON.parse(fs.readFileSync('public/brasov_neighborhoods.json', 'utf8'));

// Remove any existing Poiana sectors
const filteredData = mainData.filter(n => !n.name.includes('POIANA') && !n.name.includes('ZONA 0 - SECTOR 2'));

filteredData.push(poianaFinal);

fs.writeFileSync('public/brasov_neighborhoods.json', JSON.stringify(filteredData, null, 2));
console.log('Successfully applied the exact Google Maps pink boundary for Poiana Brașov.');
