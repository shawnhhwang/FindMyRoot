import db from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';

/**
 * 使用者註冊
 */
export function register(req, res) {
  try {
    const { username, password, displayName, email } = req.body;

    if (!username || !password || !displayName) {
      return res.status(400).json({ success: false, message: '請提供帳號、密碼與顯示稱呼' });
    }

    if (username.length < 3) {
      return res.status(400).json({ success: false, message: '帳號長度至少需 3 個字元' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: '密碼長度至少需 6 個字元' });
    }

    // 檢查帳號是否已被註冊
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim().toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: '該帳號名稱已存在，請更換其他名稱' });
    }

    const id = `user-${uuidv4().slice(0, 8)}`;
    const passHash = hashPassword(password);
    const uname = username.trim().toLowerCase();
    const dname = displayName.trim();

    // 第一個註冊的使用者自動提升為管理員，其餘預設為一般會員
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const role = userCount === 0 ? 'admin' : 'user';

    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, display_name, role, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `).run(id, uname, email || '', passHash, dname, role);

    const newUser = {
      id,
      username: uname,
      displayName: dname,
      email: email || '',
      role,
      status: 'active'
    };

    const token = generateToken(newUser);

    res.json({
      success: true,
      message: '註冊成功！',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 使用者登入
 */
export function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '請提供帳號與密碼' });
    }

    const uname = username.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(uname);

    if (!user) {
      return res.status(400).json({ success: false, message: '帳號或密碼錯誤' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ success: false, message: '此帳號已被管理員停權，請聯絡宗族管理員' });
    }

    const isMatch = comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: '帳號或密碼錯誤' });
    }

    const profile = {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      email: user.email,
      role: user.role,
      status: user.status
    };

    const token = generateToken(profile);

    res.json({
      success: true,
      message: '登入成功',
      token,
      user: profile
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 取得當前使用者個人資訊
 */
export function getMe(req, res) {
  try {
    if (!req.user) {
      return res.json({ success: true, user: null });
    }

    const user = db.prepare(`
      SELECT id, username, email, display_name, role, status, created_at 
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user || user.status === 'disabled') {
      return res.json({ success: true, user: null });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 管理員：查詢所有使用者列表
 */
export function getAllUsers(req, res) {
  try {
    const users = db.prepare(`
      SELECT id, username, email, display_name, role, status, created_at, updated_at 
      FROM users 
      ORDER BY role ASC, created_at DESC
    `).all();

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 管理員：調整使用者身分組 (admin / user)
 */
export function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: '無效的身分組' });
    }

    // 若欲降級管理員，防呆確保系統至少保留一位活躍管理員
    if (role === 'user') {
      const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active'").get().count;
      const targetUser = db.prepare("SELECT role FROM users WHERE id = ?").get(id);
      if (targetUser && targetUser.role === 'admin' && adminCount <= 1) {
        return res.status(400).json({ success: false, message: '系統至少必須保留一位管理員' });
      }
    }

    db.prepare("UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(role, id);
    res.json({ success: true, message: '使用者身分已更新' });
  } catch (error) {
    console.error('updateUserRole error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 管理員：切換使用者帳號啟用/停用狀態
 */
export function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ success: false, message: '無效的狀態值' });
    }

    // 不得停權自己
    if (req.user && req.user.id === id && status === 'disabled') {
      return res.status(400).json({ success: false, message: '無法停用自己的帳號' });
    }

    db.prepare("UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, id);
    res.json({ success: true, message: `帳號已${status === 'active' ? '啟用' : '停用'}` });
  } catch (error) {
    console.error('updateUserStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 管理員：刪除使用者
 */
export function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (req.user && req.user.id === id) {
      return res.status(400).json({ success: false, message: '無法刪除自己目前登入之帳號' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ success: true, message: '使用者已刪除' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
