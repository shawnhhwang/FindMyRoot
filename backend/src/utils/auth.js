import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'findroot-ancestor-secret-key-2026';
const TOKEN_EXPIRY = '7d';

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Express 認證中介軟體 (解析 Token，可選認證)
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    req.user = null;
    return next();
  }

  req.user = decoded;
  next();
}

/**
 * Express 強制登入中介軟體
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: '請先登入後操作' });
  }
  next();
}

/**
 * Express 強制管理員中介軟體
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: '權限不足：需要系統管理員權限' });
  }
  next();
}
