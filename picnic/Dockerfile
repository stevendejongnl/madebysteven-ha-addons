ARG BUILD_FROM
FROM ${BUILD_FROM}

# Install Python, Node and npm
RUN apk add --no-cache python3 py3-pip nodejs npm

WORKDIR /app

# Install backend dependencies via pip (avoids HA's injected UV_INDEX conflicts)
COPY backend/pyproject.toml backend/
COPY backend/src/ backend/src/
RUN pip3 install --no-cache-dir --break-system-packages \
    "python-picnic-api2" \
    "fastapi" \
    "uvicorn[standard]" \
    "aiofiles"

# Install frontend dependencies
COPY frontend/package.json frontend/package-lock.json frontend/
WORKDIR /app/frontend
RUN npm ci --prefer-offline

# Build frontend
COPY frontend/src/ src/
COPY frontend/index.html frontend/tsconfig.json frontend/vite.config.ts ./
RUN npm run build

WORKDIR /app

# Copy built frontend to backend static dir
RUN cp -r frontend/dist backend/static

# Copy startup script
COPY run.sh /run.sh
RUN chmod +x /run.sh

WORKDIR /app/backend

ENTRYPOINT ["/run.sh"]
