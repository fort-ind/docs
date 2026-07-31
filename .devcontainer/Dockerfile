FROM mcr.microsoft.com/devcontainers/javascript-node:26

# Install additional system packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    build-essential \
    python3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Ensure yarn is installed
RUN npm install -g yarn

# Install popular VS Code extensions support packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    eslint \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*



EXPOSE 3000 3001
