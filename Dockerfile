# Use official Python base image
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nodejs npm \
    build-essential \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend
COPY backend ./backend

# Copy frontend
COPY client ./client

# Install backend dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Build frontend (Vite)
WORKDIR /app/client
RUN npm install && npm run build

# Move built frontend into backend/static folder
RUN mkdir -p /app/backend/static
RUN cp -r dist/* /app/backend/static/

# Expose backend port
EXPOSE 3000

# Run Flask backend
WORKDIR /app/backend
ENV PYTHONUNBUFFERED=1

CMD ["python", "app.py"]
