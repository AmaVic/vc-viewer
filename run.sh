#!/bin/bash

# Print each command before executing it
# set -x

echo "🚀 Starting VC Viewer..."

# Check if the release binary exists
if [ ! -f "./backend/target/release/vc-viewer" ]; then
    echo "❌ Release binary not found. Please run build.sh first."
    exit 1
fi

# Run the application
cd backend
./target/release/vc-viewer 