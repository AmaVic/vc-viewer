#!/bin/bash

# Print each command before executing it
# set -x

echo "🚀 Building VC Viewer..."

# Build frontend
echo "📦 Building frontend..."
cd frontend

# Install dependencies and build
npm install
npm run build

# Check if frontend build was successful
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

# Build backend
echo "🔧 Building backend..."
cd ../backend

# Build in release mode
cargo build --release

# Check if backend build was successful
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi

echo "✅ Build completed successfully!" 