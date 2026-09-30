const API_BASE = '/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
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
