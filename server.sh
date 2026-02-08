#!/bin/bash
# Simple HTTP server launcher for testing the visualizer locally
# Usage: ./server.sh or bash server.sh

cd "$(dirname "$0")"

echo "Starting local HTTP server on http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

# Try Python 3 first, fallback to Python 2
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
else
    echo "Error: Python is required but not installed."
    echo "Please install Python 3 or Python 2."
    exit 1
fi
