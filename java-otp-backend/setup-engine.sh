#!/bin/bash

# Brașov Smart Routing - Data Setup Script
# This script downloads the large binaries required for the routing engine.

echo "🚀 Starting Brașov Smart Routing Setup..."

mkdir -p otp-config
cd otp-config

# 1. Download OpenTripPlanner 2.4.0 (Shaded JAR)
if [ ! -f "otp.jar" ]; then
    echo "📥 Downloading OpenTripPlanner Engine (180MB)..."
    curl -L -o otp.jar https://repo1.maven.org/maven2/org/opentripplanner/otp/2.4.0/otp-2.4.0-shaded.jar
else
    echo "✅ otp.jar already exists."
fi

# 2. Download Brașov Map Data (OSM PBF)
if [ ! -f "brasov.pbf" ]; then
    echo "📥 Downloading Brașov Map Data (320MB)..."
    # Using a reliable PBF source for Brașov area
    curl -L -o brasov.pbf https://download.geofabrik.de/europe/romania-latest.osm.pbf
else
    echo "✅ brasov.pbf already exists."
fi

echo "✨ Setup Complete! You can now run the engine."
echo "Command: java -Xmx4G -jar otp.jar --build --serve ."
