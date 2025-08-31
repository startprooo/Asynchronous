FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    nodejs \
    npm \
    xvfb \
    x11vnc \
    fluxbox \
    wget \
    curl \
    git \
    supervisor \
    websockify \
    locales \
    && locale-gen en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

# Install VS Code Server
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Install Node.js LTS
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn

# Set up VS Code extensions directory
RUN mkdir -p /root/.local/share/code-server/extensions

# Install essential VS Code extensions
RUN code-server --install-extension ms-python.python \
    --install-extension dbaeumer.vscode-eslint \
    --install-extension esbenp.prettier-vscode \
    --install-extension GitHub.copilot \
    --install-extension ritwickdey.LiveServer \
    --install-extension ms-azuretools.vscode-docker \
    --install-extension christian-kohler.path-intellisense \
    --install-extension formulahendry.auto-rename-tag

# Install Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install Node.js dependencies
RUN npm install
RUN cd frontend && npm install

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Build frontend and backend
RUN npm run build
RUN cd frontend && npm run build

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports
EXPOSE 8000 5173 5900 9222

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
