# ==========================================
# 階段一：構建 Vue 3 前端資源
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# 階段二：正式運作環境 (Node.js + SQLite)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# 安裝 better-sqlite3 原生模組所需之編譯工具
RUN apk add --no-cache python3 make g++

ENV NODE_ENV=production
ENV PORT=3001

# 安裝後端相依套件 (僅保留生產環境依賴)
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# 複製後端原始碼
COPY backend/ ./backend/

# 將階段一產生的前端靜態檔案複製至後端 SPA 託管路徑
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# 定義 SQLite 資料持久化掛載點
VOLUME ["/app/backend/data"]

EXPOSE 3001

WORKDIR /app/backend
CMD ["node", "src/index.js"]
