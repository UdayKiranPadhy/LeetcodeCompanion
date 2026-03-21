# ── Stage 1: Build — install deps + Playwright browser binaries ───────────────
FROM python:3.12-slim-bookworm AS builder

WORKDIR /app

# System libraries required by Chromium (used by crawl4ai via Playwright)
RUN apt-get update && apt-get install -y --no-install-recommends \
        wget curl gnupg ca-certificates \
        libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
        libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
        libxdamage1 libxfixes3 libxrandr2 libgbm1 \
        libasound2 libpango-1.0-0 libcairo2 libatspi2.0-0 \
        libwayland-client0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright's Chromium browser (only Chromium — saves ~200 MB vs all browsers)
RUN python -m playwright install chromium \
    && python -m playwright install-deps chromium

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM python:3.12-slim-bookworm AS runtime

WORKDIR /app

# Same Chromium runtime libraries needed at run time
RUN apt-get update && apt-get install -y --no-install-recommends \
        libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
        libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
        libxdamage1 libxfixes3 libxrandr2 libgbm1 \
        libasound2 libpango-1.0-0 libcairo2 libatspi2.0-0 \
        libwayland-client0 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder
COPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy Playwright browser binaries from builder
COPY --from=builder /root/.cache/ms-playwright /root/.cache/ms-playwright

# Copy application source
COPY . .

EXPOSE 8000

# GOOGLE_API_KEY and CORS_ORIGINS must be injected at runtime via env vars or .env file.
# Never bake secrets into the image.

CMD ["uvicorn", "index:app", "--host", "0.0.0.0", "--port", "8000"]
