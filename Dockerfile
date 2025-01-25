FROM rust:1.84 AS builder

WORKDIR /usr/src/app

# Copy frontend files first (needed for SEO files)
COPY frontend frontend/

# Copy the Cargo files
COPY backend/Cargo.toml backend/Cargo.lock* backend/

# Copy source code
COPY backend/src backend/src

# Build the backend
WORKDIR /usr/src/app/backend
RUN cargo build --release

FROM ubuntu:22.04

# Install minimal dependencies and clean up
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory structure
WORKDIR /app/backend

# Copy only the backend binary
COPY --from=builder /usr/src/app/backend/target/release/vc-viewer .

# Copy frontend files maintaining the exact structure
COPY --from=builder /usr/src/app/frontend /app/frontend

# Environment variables for proper binding and logging
ENV RUST_LOG=debug
ENV HOST=0.0.0.0
ENV PORT=8080

# Health check configuration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/_health || exit 1

EXPOSE 8080
CMD ["./vc-viewer"] 