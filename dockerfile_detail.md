# Multi-stage Dockerfile:
# 1) build: dùng Node để build ra static files (dist)
# 2) runner: dùng Nginx để serve static files (nhẹ, phù hợp production)

# ---- Build stage ----
FROM node:20-alpine AS build  # Image Node (alpine nhẹ) để build
WORKDIR /app                 # Thư mục làm việc trong container

# Cài dependencies trước để tận dụng Docker layer cache:
# - Nếu code đổi nhưng package*.json không đổi thì không cần cài lại deps
COPY package*.json ./
RUN npm ci                   # Cài deps đúng theo lockfile (ổn định cho CI/CD)

# Copy toàn bộ source rồi build
COPY . .
RUN npm run build            # Với Vite/React thường output ra thư mục /app/dist

# ---- Run stage (serve static files) ----
FROM nginx:1.27-alpine AS runner  # Image Nginx để serve static (production)

# Ghi đè default config của Nginx:
# - Hỗ trợ SPA routing: route không phải file thật sẽ fallback về /index.html
# - Cache static assets (js/css/images/fonts) để tăng tốc load
RUN rm -f /etc/nginx/conf.d/default.conf && \
  printf '%s\n' \
  'server {' \
  '  listen 80;' \
  '  server_name _;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '' \
  '  # SPA fallback: nếu không tìm thấy file thì trả index.html để client router xử lý' \
  '  location / {' \
  '    try_files $uri $uri/ /index.html;' \
  '  }' \
  '' \
  '  # Cache static assets (Vite thường build ra file có hash nên dùng immutable hợp lý)' \
  '  location ~* \.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$ {' \
  '    expires 7d;' \
  '    add_header Cache-Control "public, max-age=604800, immutable";' \
  '    try_files $uri =404;' \
  '  }' \
  '}' \
  > /etc/nginx/conf.d/default.conf

# Copy build artifacts (dist) từ stage build sang thư mục Nginx serve
# Vite builds to /dist by default
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80                    # Container lắng nghe cổng 80
CMD ["nginx", "-g", "daemon off;"]  # Chạy Nginx foreground để container không thoát