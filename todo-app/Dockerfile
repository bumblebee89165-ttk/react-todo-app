# ---- Build stage ----
FROM node:20-alpine AS build 
WORKDIR /app

# Install dependencies (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- Run stage (serve static files) ----
FROM nginx:1.27-alpine AS runner

# SPA routing + static caching (React/Vite)
RUN rm -f /etc/nginx/conf.d/default.conf && \
  printf '%s\n' \
  'server {' \
  '  listen 80;' \
  '  server_name _;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '' \
  '  location / {' \
  '    try_files $uri $uri/ /index.html;' \
  '  }' \
  '' \
  '  location ~* \.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$ {' \
  '    expires 7d;' \
  '    add_header Cache-Control "public, max-age=604800, immutable";' \
  '    try_files $uri =404;' \
  '  }' \
  '}' \
  > /etc/nginx/conf.d/default.conf

# Vite builds to /dist by default
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]