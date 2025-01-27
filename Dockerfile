FROM rust:1.84 AS builder

# Install Node.js in the Rust image
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy the entire project (needed for build script)
COPY . .

# Make scripts executable
RUN chmod +x build.sh run.sh

# Build the project (includes both frontend and backend)
RUN ./build.sh

FROM ubuntu:22.04

# Install minimal dependencies and clean up
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory structure
WORKDIR /app

# Copy the built application and scripts
COPY --from=builder /usr/src/app/backend/target/release/vc-viewer backend/target/release/
COPY --from=builder /usr/src/app/frontend/dist frontend/dist
COPY --from=builder /usr/src/app/frontend/src frontend/src
COPY --from=builder /usr/src/app/run.sh .

# Make run script executable
RUN chmod +x run.sh

# Environment variables for proper binding and logging
ENV RUST_LOG=info
ENV HOST=0.0.0.0
ENV PORT=8080

# Health check configuration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/_health || exit 1

EXPOSE 8080
CMD ["./run.sh"] 