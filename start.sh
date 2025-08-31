#!/bin/bash

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

# Create virtual display if not in container
if [ ! -f /.dockerenv ]; then
    if ! command -v Xvfb &> /dev/null; then
        echo "Installing Xvfb..."
        sudo apt-get update
        sudo apt-get install -y xvfb x11vnc fluxbox
    fi

    # Start virtual display if not already running
    if ! pgrep Xvfb > /dev/null; then
        Xvfb :99 -screen 0 1920x1080x24 &
        export DISPLAY=:99
        sleep 2
        fluxbox &
        x11vnc -display :99 -nopw -forever -shared &
    fi
fi

# Install dependencies
echo "Installing dependencies..."
npm install
cd frontend && npm install && cd ..

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

# Build the project
echo "Building the project..."
npm run build
cd frontend && npm run build && cd ..

# Start the services
echo "Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Start noVNC if not in container
if [ ! -f /.dockerenv ]; then
    if ! pgrep websockify > /dev/null; then
        websockify --web /usr/share/novnc 8080 localhost:5900 &
    fi
fi

echo "Browser automation is available at:"
echo "- VNC: vnc://localhost:5900"
echo "- Web VNC: http://localhost:8080/vnc.html"
echo "- Chrome DevTools: http://localhost:9222"

# Start the development server
echo "Starting development server..."
npm run dev
