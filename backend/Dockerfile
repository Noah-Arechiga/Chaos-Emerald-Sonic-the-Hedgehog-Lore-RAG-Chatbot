FROM node:20-slim

# Better-sqlite3 needs build tools to compile its native binding
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p /app/data

EXPOSE 3001

# Ingest the seed corpus on first boot if the DB doesn't exist yet, then start
CMD ["sh", "-c", "test -f /app/data/lore.db || npm run ingest; npm start"]
