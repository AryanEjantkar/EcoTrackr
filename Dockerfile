# Use official Python slim image as base
FROM python:3.11-slim

# Install system dependencies, curl, build essentials, and Node.js 20
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

# Create a non-privileged user (uid 1000) for security compatibility with Hugging Face Spaces
RUN useradd -m -u 1000 user
WORKDIR /home/user/app

# Copy dependency configs first for caching
COPY --chown=user:user backend/requirements.txt ./backend/
COPY --chown=user:user frontend/package*.json ./frontend/

# Install python requirements
RUN pip install --no-cache-dir -r backend/requirements.txt

# Install npm requirements
WORKDIR /home/user/app/frontend
RUN npm ci

# Copy the rest of the application files
WORKDIR /home/user/app
COPY --chown=user:user backend ./backend
COPY --chown=user:user frontend ./frontend
COPY --chown=user:user start.sh ./start.sh

# Make start script executable
RUN chmod +x start.sh

# Train the Random Forest predictor model on container build
WORKDIR /home/user/app/backend
RUN python train_model.py

# Build Next.js application bundle in production mode
WORKDIR /home/user/app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Reset working directory
WORKDIR /home/user/app

# Expose port 7860 (Hugging Face standard)
EXPOSE 7860

# Switch to the non-root user
USER user

# Start the joint FastAPI + NextJS launcher
CMD ["./start.sh"]
