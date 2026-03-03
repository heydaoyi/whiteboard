#!/bin/bash

echo "==================================="
echo "   Whiteboard App Startup Script   "
echo "==================================="

read -p "Enter Frontend Port [default 5173]: " FRONTEND_PORT
FRONTEND_PORT=${FRONTEND_PORT:-5173}

read -p "Enter Backend Port [default 3001]: " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-3001}

echo ""
echo "Starting Backend on port $BACKEND_PORT..."
(cd server && PORT=$BACKEND_PORT node index.js) &
BACKEND_PID=$!

echo "Starting Frontend on port $FRONTEND_PORT..."
(cd client && VITE_API_URL=http://localhost:$BACKEND_PORT/api npm run dev -- --port $FRONTEND_PORT) &
FRONTEND_PID=$!

echo ""
echo "Services are starting!"
echo "Frontend will be accessible at: http://localhost:$FRONTEND_PORT"
echo "Backend API is running at: http://localhost:$BACKEND_PORT"
echo "Press [Ctrl+C] to stop both services."

# Trap Ctrl+C to kill both background processes
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
