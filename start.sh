#!/bin/bash

# Exit immediately if any command fails
set -e

echo "=================================================="
echo "         EcoTrackr Space Bootstrapper             "
echo "=================================================="

# Start backend FastAPI server in the background on localhost:8000
echo "[Boot] Starting backend FastAPI server..."
cd /home/user/app/backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &

# Give FastAPI a few seconds to load the ML model and start listening
echo "[Boot] Waiting for backend API to initialize..."
sleep 4

# Start frontend Next.js server on port 7860 (Hugging Face default)
echo "[Boot] Starting frontend Next.js server on port 7860..."
cd /home/user/app/frontend
exec npx next start -p 7860
