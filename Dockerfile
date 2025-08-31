FROM ubuntu:22.04

# Set noninteractive installation
ENV DEBIAN_FRONTEND=noninteractive

# Create a non-root user
ARG USERNAME=developer
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Install system dependencies and security updates
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    # Development tools
    build-essential \
    cmake \
    git \
    curl \
    wget \
    # Python environment
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    # Node.js environment
    nodejs \
    npm \
    # Code editors
    vim \
    nano \
    # System utilities
    sudo \
    ca-certificates \
    gnupg \
    lsb-release \
    locales \
    # Security tools
    ufw \
    fail2ban \
    # Development server
    supervisor \
    # Clean up
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Configure locale
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# Create the user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Install Python packages globally
RUN python3 -m pip install --no-cache-dir --upgrade \
    pip \
    setuptools \
    wheel \
    virtualenv \
    pylint \
    black \
    mypy

# Install Node.js packages globally
RUN npm install -g \
    npm@latest \
    typescript \
    eslint \
    prettier

# Set up security measures
RUN ufw default deny incoming \
    && ufw default allow outgoing \
    && ufw allow ssh \
    && echo "y" | ufw enable

# Configure fail2ban
COPY config/fail2ban/jail.local /etc/fail2ban/jail.local
RUN service fail2ban start

# Set up development directory
WORKDIR /workspace
RUN chown $USERNAME:$USERNAME /workspace

# Switch to non-root user
USER $USERNAME

# Configure development environment
COPY --chown=$USERNAME:$USERNAME config/.bashrc /home/$USERNAME/.bashrc
COPY --chown=$USERNAME:$USERNAME config/.gitconfig /home/$USERNAME/.gitconfig

# Expose development ports
EXPOSE 3000 8000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["/bin/bash"]

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
