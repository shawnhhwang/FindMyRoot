const API_BASE = '/api/v1';

let authToken = localStorage.getItem('findroot_token') || '';

export function setAuthToken(token) {
  authToken = token || '';
  if (token) {
    localStorage.setItem('findroot_token', token);
  } else {
    localStorage.removeItem('findroot_token');
  }
}

export function getAuthToken() {
  return authToken;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || `API 請求失敗 (${response.status})`);
  }
  return data;
}

export const api = {
  // 會員認證與帳號
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // 管理員專用
  getAdminUsers: () => request('/admin/users'),
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  updateUserStatus: (id, status) => request(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),

  // LLM 助手與 FAQ
  chatWithLLM: (data) => request('/llm/chat', { method: 'POST', body: JSON.stringify(data) }),
  getFaqList: () => request('/llm/faq'),
  getAIConfig: () => request('/llm/config'),
  updateAIConfig: (data) => request('/llm/config', { method: 'PUT', body: JSON.stringify(data) }),

  // 成員管理
  getMembers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/members${query ? `?${query}` : ''}`);
  },
  getMemberById: (id) => request(`/members/${id}`),
  createMember: (data) => request('/members', { method: 'POST', body: JSON.stringify(data) }),
  updateMember: (id, data) => request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),

  // 族譜與親屬
  getTreeRoots: () => request('/genealogy/roots'),
  getFamilyTree: (rootId) => request(`/genealogy/tree${rootId ? `?rootId=${rootId}` : ''}`),
  addRelationship: (data) => request('/genealogy/relationship', { method: 'POST', body: JSON.stringify(data) }),
  deleteRelationship: (id) => request(`/genealogy/relationship/${id}`, { method: 'DELETE' }),

  // 曆法轉換
  solarToLunar: (data) => request('/calendar/solar-to-lunar', { method: 'POST', body: JSON.stringify(data) }),
  lunarToSolar: (data) => request('/calendar/lunar-to-solar', { method: 'POST', body: JSON.stringify(data) }),
  getBranchHours: () => request('/calendar/branch-hours'),

  // 牌位工作室
  formatTablet: (data) => request('/tablet/format', { method: 'POST', body: JSON.stringify(data) }),
  validateTablet: (data) => request('/tablet/validate', { method: 'POST', body: JSON.stringify(data) }),
  getTabletRecords: () => request('/tablet/records'),
  saveTabletRecord: (data) => request('/tablet/records', { method: 'POST', body: JSON.stringify(data) }),
  deleteTabletRecord: (id) => request(`/tablet/records/${id}`, { method: 'DELETE' }),

  // 宗族設定與備份
  getBranchInfo: () => request('/branch/info'),
  updateBranchInfo: (data) => request('/branch/info', { method: 'PUT', body: JSON.stringify(data) }),
  exportBackupUrl: () => `${API_BASE}/backup/export`,
  importBackup: (data) => request('/backup/import', { method: 'POST', body: JSON.stringify(data) }),
  resetDemoData: () => request('/backup/reset-demo', { method: 'POST' })
};
