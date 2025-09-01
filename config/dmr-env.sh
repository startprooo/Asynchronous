#!/bin/bash

# DMR Environment Setup
export DOCKER_MODEL_RUNNER_HOST=unix:///var/run/docker.sock
export DOCKER_MODEL_RUNNER_TCP_ENABLED=true
export DOCKER_MODEL_RUNNER_TCP_PORT=12434
export DOCKER_MODEL_RUNNER_BASE_URL=http://localhost:12434

# Add Docker Model Runner to PATH if installed in custom location
if [ -d "$HOME/.docker/cli-plugins" ]; then
    export PATH="$HOME/.docker/cli-plugins:$PATH"
fi

# Ensure proper permissions for Docker socket
if [ -S /var/run/docker.sock ]; then
    if ! groups | grep -q docker; then
        echo "Warning: Current user is not in the docker group"
        echo "You may need to run: sudo usermod -aG docker $USER"
    fi
fi
