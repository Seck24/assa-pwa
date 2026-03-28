FROM node:20-alpine
WORKDIR /app

# Install deps + build in one layer
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Prepare standalone
RUN cp -r .next/static .next/standalone/.next/static
RUN cp -r public .next/standalone/public

WORKDIR /app/.next/standalone
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
