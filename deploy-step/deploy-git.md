# Deploy Todo App lên GitHub Pages (Chi tiết)

GitHub Pages là dịch vụ hosting static miễn phí của GitHub, rất phù hợp cho React app như của bạn.

## Bước 1: Chuẩn bị Repository

```bash
# Tạo repo trên GitHub (nếu chưa có)
# Giả sử repo name: todo-list

# Push code lên GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/todo-list.git
git push -u origin main
```

## Bước 2: Cấu hình Vite cho GitHub Pages

Cập nhật **vite.config.ts**:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/todo-list/', // ⚠️ Thay 'todo-list' bằng tên repo của bạn
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

**Lưu ý**: `base` phải trùng với tên repository!

## Bước 3: Cài đặt gh-pages

```bash
cd todo-app
npm install --save-dev gh-pages
```

## Bước 4: Thêm Scripts Deploy

Cập nhật **package.json**:

```json
{
  "name": "todo-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "homepage": "https://USERNAME.github.io/todo-list/",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**Thay `USERNAME`** bằng username GitHub của bạn!

## Bước 5: Deploy

```bash
# Trong folder todo-app
npm run deploy
```

Lệnh này sẽ:
1. Build app (`npm run build`)
2. Tạo branch `gh-pages`
3. Push folder `dist` lên branch đó
4. GitHub Pages tự động serve

## Bước 6: Bật GitHub Pages trên Repo

1. Vào repo trên GitHub
2. **Settings** → **Pages** (menu bên trái)
3. **Source**: Chọn **Deploy from a branch**
4. **Branch**: Chọn `gh-pages` + `/root`
5. **Save**

Đợi 1-2 phút, app sẽ live tại:
```
https://USERNAME.github.io/todo-list/
```

## Cấu trúc sau khi deploy

```
your-repo/
├── main (branch)          ← Source code
│   ├── todo-app/
│   │   ├── src/
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── Dockerfile
│
└── gh-pages (branch)      ← Build output (auto)
    ├── index.html
    ├── assets/
    └── ...
```

## Xử lý Routing (React Router)

Nếu dùng React Router, **cần config thêm**:

### Option A: HashRouter (Dễ nhất)

```typescript
import { HashRouter } from 'react-router-dom'

root.render(
  <HashRouter>
    <App />
  </HashRouter>
)
```

URL sẽ dạng: `https://user.github.io/todo-list/#/about`

### Option B: BrowserRouter + 404.html trick

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script>
    // Redirect 404 về index.html với path trong query
    sessionStorage.redirect = location.href;
  </script>
  <meta http-equiv="refresh" content="0;URL='/todo-list/'">
</head>
<body></body>
</html>
```

```html
<script>
  (function() {
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect && redirect != location.href) {
      history.replaceState(null, null, redirect);
    }
  })();
</script>
```

## GitHub Actions (Auto Deploy)

Tạo file để tự động deploy khi push code:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./todo-app
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: './todo-app/package-lock.json'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./todo-app/dist
```

Sau đó mỗi lần push lên `main` sẽ tự động deploy!

## Kiểm tra Local trước khi Deploy

```bash
# Build và preview
npm run build
npm run preview

# Hoặc serve thủ công
npx serve dist -s -p 3000
```

Mở http://localhost:3000 để test.

## Lỗi thường gặp

### 1. Blank page sau deploy
✅ **Fix**: Kiểm tra `base` trong `vite.config.ts` khớp với tên repo

### 2. Assets 404
✅ **Fix**: Đảm bảo `homepage` trong `package.json` đúng

### 3. Routing không hoạt động
✅ **Fix**: Dùng `HashRouter` hoặc setup 404.html

### 4. "Permission denied" khi deploy
✅ **Fix**: Cấu hình GitHub token:
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

## So sánh các phương án Free

| Platform | Ưu điểm | Nhược điểm |
|----------|---------|------------|
| **GitHub Pages** | ✅ Hoàn toàn free<br>✅ Tích hợp Git<br>✅ Custom domain | ❌ Chỉ static<br>❌ Giới hạn 1GB |
| **Vercel** | ✅ Auto deploy<br>✅ Serverless functions<br>✅ Siêu nhanh | ❌ Bandwidth limit |
| **Netlify** | ✅ Tương tự Vercel<br>✅ Form handling | ❌ Build minutes limit |

**Kết luận**: GitHub Pages là **best choice** cho todo app này (không cần backend, hoàn toàn free, không giới hạn bandwidth).