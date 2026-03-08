ARG BUILD_FROM
FROM $BUILD_FROM

# Install Python deps, Node, npm
RUN apk add --no-cache python3 py3-pip nodejs npm

WORKDIR /app

# Install backend dependencies via pip (avoids HA's injected UV_INDEX conflicts)
COPY backend/pyproject.toml backend/
COPY backend/src/ backend/src/
RUN pip3 install --no-cache-dir --break-system-packages \
    "python-picnic-api2" \
    "fastapi" \
    "uvicorn[standard]" \
    "pydantic-settings" \
    "aiofiles"

# Build frontend
COPY frontend/package.json frontend/
RUN cd frontend && npm install --prefer-offline
COPY frontend/src/ frontend/src/
COPY frontend/index.html frontend/tsconfig.json frontend/vite.config.ts frontend/
RUN cd frontend && npm run build

# Copy built frontend to backend static dir
RUN cp -r frontend/dist backend/static

# Copy startup script
COPY run.sh /run.sh
RUN chmod +x /run.sh

WORKDIR /app/backend

ENTRYPOINT ["/run.sh"]
