### Check Node version
    node --version
### Tạo dự án với Vite
    npm create vite@latest .         (thêm . để nó cài thẳng vào folder)

### Cài MUI
    npm install @mui/material @emotion/react @emotion/styled
    npm install @mui/icons-material

### Xóa file App.css đi, reset file Index.css, nhập 3 thuộc tính này để reset default
    *{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

### Cài font Roboto
    npm install @fontsource/roboto

### Thêm import font vào file Index.css
    @import '@fontsource/roboto/300.css';
    @import '@fontsource/roboto/400.css';
    @import '@fontsource/roboto/500.css';
    @import '@fontsource/roboto/700.css';

### Cài thư viện tạo Guid
    npm install uuid