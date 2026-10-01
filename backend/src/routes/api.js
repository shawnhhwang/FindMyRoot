import express from 'express';
import { 
  getMembers, 
  getMemberById, 
  createMember, 
  updateMember, 
  deleteMember 
} from '../controllers/memberController.js';
import { 
  getFamilyTree, 
  getTreeRoots, 
  addRelationship, 
  deleteRelationship 
} from '../controllers/genealogyController.js';
import { 
  solarToLunar, 
  lunarToSolar, 
  getBranchHours 
} from '../controllers/calendarController.js';
import { 
  formatTablet, 
  validateTabletText, 
  getTabletRecords, 
  saveTabletRecord, 
  deleteTabletRecord 
} from '../controllers/tabletController.js';
import { 
  getBranchInfo, 
  updateBranchInfo, 
  exportDatabaseBackup, 
  importDatabaseBackup, 
  resetDemoData 
} from '../controllers/branchController.js';
import {
  register,
  login,
  getMe,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser
} from '../controllers/authController.js';
import {
  chatWithAssistant,
  getFaqList,
  getAIConfig,
  updateAIConfig
} from '../controllers/llmController.js';
import { requireAuth, requireAdmin } from '../utils/auth.js';

const router = express.Router();

// ==========================================
// 帳號認證與會員權限 API
// ==========================================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', getMe);

// 管理員專用：使用者列表與權限管理
router.get('/admin/users', requireAdmin, getAllUsers);
router.put('/admin/users/:id/role', requireAdmin, updateUserRole);
router.put('/admin/users/:id/status', requireAdmin, updateUserStatus);
router.delete('/admin/users/:id', requireAdmin, deleteUser);

// ==========================================
// LLM 助手與 FAQ 知識庫 API
// ==========================================
router.post('/llm/chat', chatWithAssistant);
router.get('/llm/faq', getFaqList);
router.get('/llm/config', getAIConfig);
router.put('/llm/config', requireAdmin, updateAIConfig);

// ==========================================
// 族人成員管理 API
// ==========================================
router.get('/members', getMembers);
router.get('/members/:id', getMemberById);
router.post('/members', createMember);
router.put('/members/:id', updateMember);
router.delete('/members/:id', deleteMember);

// ==========================================
// 世系圖與親屬關係 API
// ==========================================
router.get('/genealogy/roots', getTreeRoots);
router.get('/genealogy/tree', getFamilyTree);
router.post('/genealogy/relationship', addRelationship);
router.delete('/genealogy/relationship/:id', deleteRelationship);

// ==========================================
// 國農曆與干支時辰 API
// ==========================================
router.post('/calendar/solar-to-lunar', solarToLunar);
router.post('/calendar/lunar-to-solar', lunarToSolar);
router.get('/calendar/branch-hours', getBranchHours);

// ==========================================
// 祖先牌位工作室 API
// ==========================================
router.post('/tablet/format', formatTablet);
router.post('/tablet/validate', validateTabletText);
router.get('/tablet/records', getTabletRecords);
router.post('/tablet/records', saveTabletRecord);
router.delete('/tablet/records/:id', deleteTabletRecord);

// ==========================================
// 宗族設定與備份還原 API
// ==========================================
router.get('/branch/info', getBranchInfo);
router.put('/branch/info', updateBranchInfo);
router.get('/backup/export', exportDatabaseBackup);
router.post('/backup/import', importDatabaseBackup);
router.post('/backup/reset-demo', resetDemoData);

export default router;
