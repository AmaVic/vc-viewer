FROM rust:1.84 AS builder

WORKDIR /usr/src/app

# Copy only the backend files needed for building
COPY backend/Cargo.toml backend/Cargo.lock backend/
COPY backend/src backend/src

# Build the backend
WORKDIR /usr/src/app/backend
RUN cargo build --release

FROM ubuntu:22.04

# Install minimal dependencies and clean up
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create app directory structure
WORKDIR /app/backend

# Copy only the backend binary
COPY --from=builder /usr/src/app/backend/target/release/vc-viewer .

# Copy the entire frontend directory to match the server's expected path
COPY frontend /app/frontend

# Environment variables for proper binding and logging
ENV RUST_LOG=debug
ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080
CMD ["./vc-viewer"] 