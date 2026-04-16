#!/bin/bash
echo "Restarting Telkom Insight Hub server..."
echo "Stopping any running instances..."
pkill -f "node.*server/index.js" 2>/dev/null
echo "Starting server..."
node server/index.js &
echo "Server restart initiated. Check the terminal for logs."