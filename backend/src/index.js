import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import apiRouter from './routes/api.js';
import { initializeDatabase } from './db/init.js';
import { authenticateToken } from './utils/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../frontend/dist');

const app = express();
const PORT = process.env.PORT || 3001;

// 中介軟體設定
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(authenticateToken);

// 初始化資料庫
initializeDatabase();

// 掛載 API 路由
app.use('/api/v1', apiRouter);

// 根路徑狀態探針
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'FindRoot Backend API',
    timestamp: new Date().toISOString()
  });
});

// 若 frontend/dist 存在，提供前端 SPA 靜態檔案託管
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`尋根系統 (FindRoot) 伺服器已啟動`);
  console.log(`首頁網址: http://localhost:${PORT}`);
  console.log(`API 端點: http://localhost:${PORT}/api/v1`);
  console.log(`========================================`);
});
