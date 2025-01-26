#!/bin/bash

# Print each command before executing it
# set -x

echo "🧹 Cleaning VC Viewer..."

# Clean frontend
echo "🧹 Cleaning frontend..."
cd frontend
rm -rf dist .parcel-cache node_modules
echo "✅ Frontend cleaned"

# Clean backend
echo "🧹 Cleaning backend..."
cd ../backend
cargo clean
echo "✅ Backend cleaned"

echo "✨ Clean completed successfully!" 