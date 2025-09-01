#!/bin/bash

# Source environment variables
set -a
source .env.dmr
set +a

# Ensure Docker CLI plugins directory exists
mkdir -p ~/.docker/cli-plugins

# Install Docker Model Runner plugin if not already installed
if [ ! -f ~/.docker/cli-plugins/docker-model ]; then
    echo "Installing Docker Model Runner plugin..."
    ARCH=$(uname -m)
    case $ARCH in
        x86_64)
            ARCH_NAME="amd64"
            ;;
        aarch64)
            ARCH_NAME="arm64"
            ;;
        *)
            echo "Unsupported architecture: $ARCH"
            exit 1
            ;;
    esac
    
    curl -L -o ~/.docker/cli-plugins/docker-model \
        "https://github.com/docker/model/releases/latest/download/docker-model-linux-$ARCH_NAME"
    chmod +x ~/.docker/cli-plugins/docker-model
fi

# Pull the SmolLM2 model
echo "Pulling SmolLM2 model..."
docker model pull ai/smollm2:360M-Q4_K_M

# Test the model
echo "Testing model..."
docker model run ai/smollm2:360M-Q4_K_M "Hello! Give me a short test response."
