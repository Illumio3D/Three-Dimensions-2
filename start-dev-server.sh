#!/bin/bash

# Development Server for Three Dimensions Website
# This script starts a simple HTTP server that can be accessed from other devices on your local network

# Color codes for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Three Dimensions Development Server${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Python 3 is installed
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo -e "${YELLOW}Python is not installed. Please install Python 3.${NC}"
    exit 1
fi

# Get local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
else
    # Windows (Git Bash)
    LOCAL_IP=$(ipconfig | grep "IPv4" | awk '{print $NF}' | head -n 1)
fi

# Default port
PORT=8000

echo -e "${GREEN}Starting HTTP server on port ${PORT}...${NC}"
echo ""
echo -e "${BLUE}Access the website from:${NC}"
echo -e "  Local:    ${GREEN}http://localhost:${PORT}${NC}"
echo -e "  Network:  ${GREEN}http://${LOCAL_IP}:${PORT}${NC}"
echo ""
echo -e "${YELLOW}To access from your iPhone:${NC}"
echo -e "  1. Make sure your iPhone is on the same WiFi network"
echo -e "  2. Open Safari on your iPhone"
echo -e "  3. Go to: ${GREEN}http://${LOCAL_IP}:${PORT}${NC}"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop the server${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Start the server
$PYTHON_CMD -m http.server $PORT
