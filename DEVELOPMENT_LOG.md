# 尋根系統（FindRoot）：開發歷程記錄 (DEVELOPMENT_LOG.md)

本文件詳實記錄「尋根系統（FindRoot）」從需求分析、技術設計到全端實作與測試的完整歷程。

---

## 專案概要

- **專案名稱**：尋根系統（FindRoot）- 祖先牌位與族譜管理系統
- **前端技術**：Vue 3 (Composition API) + Vite + Tailwind CSS + Lucide Icons + D3.js 輔助
- **後端技術**：Node.js + Express (ESM) + SQLite (`better-sqlite3`) + `lunar-javascript`
- **架構特點**：前後端分離架構，同時後端具備 SPA 靜態託管能力，單一 Node 程序即可於本機或伺服器啟動完整 Web 服務。

---

## 歷程演進與重要決策

### 1. 規格制定與任務拆解 (SPEC.md & TASK_LIST.md)
- **牌位文字規範**：詳細梳理華人傳統神主牌「生、老、病、死、苦」五字吉數計算原理：
  $$\text{字數} \pmod 5 = 1 \text{ (生，吉)}, \quad 2 \text{ (老，吉)}, \quad 3 \text{ (病，凶)}, \quad 4 \text{ (死，凶)}, \quad 0 \text{ (苦，凶)}$$
  中行主神位講究「合老」（如 7、12、17、22 字）或「合生」；兩側生卒與奉祀亦講求合生或合老。
- **資料庫設計**：採用單一 SQLite 檔案庫（`data/findroot.sqlite`），開啟 WAL 模式與 Foreign Key 限制，具備無須配置資料庫伺服器、易於備份轉移的特點。

### 2. 後端核心實作 (Backend & Database)
- **資料庫初始化與種子資料**：
  - 建立 `family_branches`（宗族分支、堂號、開基祖、行輩字輩歌）。
  - 建立 `people`（族人名諱、字輩、世代、生卒年農曆國曆干支、安葬位址、生平行誼）。
  - 建立 `relationships`（父親、母親、配偶關聯）。
  - 建立 `tablet_records`（牌位自訂排版記錄）。
  - 灌入四代代表性家族「穎川陳氏」11 位族人與示範神主牌位。
- **曆法模組 (`src/utils/calendar.js`)**：
  - 整合 `lunar-javascript`，提供 `convertSolarToLunar` 與 `convertLunarToSolar`。
  - 建立十二時辰對應（子丑寅卯辰巳午未申酉戌亥）。
- **牌位格式化與校驗模組 (`src/utils/tablet.js`)**：
  - 實作男女考妣模板自動產生。
  - 實作即時字數統計、吉凶判定與調整增減字建議演算法。
- **RESTful API**：
  - 建立成員 CRUD、世系樹遞迴建構、牌位存取、JSON 全庫備份與還原等完整 API。

### 3. 前端現代化介面實作 (Vue 3 + Tailwind CSS)
- **美學風格設計**：
  - 設計古典東方氣質的調色盤（深紅木色、赭石黃、沉香黑、宣紙米白）。
  - 支援傳統書法楷體字型與金色文字陰影雕刻質感（`gold-text-emboss`）。
- **國農曆雙向切換選取器 (`LunarDatePicker.vue`)**：
  - 支援使用者輸入西元日期即時推算農曆干支八字與民國紀年；或直接輸入古族譜上的農曆年月日（支援閏月與時辰），自動換算西元日期。
- **族人名冊管理視圖 (`MemberListView.vue` & `MemberModal.vue`)**：
  - 提供即時姓名/字輩關鍵字搜尋與世代/性別篩選。
  - 登錄表單整合雙親下拉選單、生卒國農曆選取與安葬座向。
- **互動式家族世系樹 (`FamilyTree.vue` & `TreeNode.vue`)**：
  - 支援拖曳平移、按鈕縮放與開基祖切換。
  - 節點支援世代徽章、配偶連帶標註、生死狀態標籤、展開/收合子孫節點。
- **祖先牌位工作室 (`TabletStudioView.vue` & `TabletPreview.vue`)**：
  - 實現垂直直排文字排版（CSS `writing-mode: vertical-rl`）。
  - 提供紅木金字、沉香黑檀、白底列印紙樣切換。
  - 即時「生老病死苦」字數警示卡與補字建議快捷鍵。
  - 支援瀏覽器列印紙樣格式。
- **系統備份與設定 (`SettingsView.vue`)**：
  - 單鍵下載完整 JSON 備份檔；支援上傳 JSON 進行資料庫還原，並提供示範資料重設按鈕。

### 5. 會員註冊、認證與管理員權限體系 (User Auth & Admin Control)
- **安全架構設計**：
  - 整合 `bcryptjs` 進行高強度加鹽雜湊密碼保存；整合 `jsonwebtoken` 實現無狀態 JWT 傳遞與驗證。
  - 設計 `users` 表並預設種子帳號：系統管理員（`admin` / `admin123`）與宗親會員（`clan_member` / `user123`）。
- **權限分級中介軟體 (`src/utils/auth.js`)**：
  - 全域注入 `authenticateToken` 解析 Token。
  - `requireAdmin` 嚴密保護管理員端點（使用者清單檢視、身分切換、啟用停權、使用者刪除與 AI 配置更新）。
- **前端會員互動元件**：
  - 建立 `AuthModal.vue`（支援登入與註冊切換、示範帳號一鍵自動填入）。
  - 在 `Navbar.vue` 呈現登入稱呼、管理員/會員身分標籤與登出機制。
  - 在 `SettingsView.vue` 為管理員提供直觀的「宗親會員帳號與權限管理」清單與身分升降級切換。

### 6. LLM 智慧禮制問答助手與 FAQ 知識庫 (AI Assistant & Knowledge Base)
- **領域專屬知識庫 (`src/utils/llmAssistant.js`)**：
  - 收錄華人神主牌位「兩生合一老」字數吉凶算法、男考女妣稱謂與排版模板、堂號郡望由來、十二時辰與八字對照、行輩歌命名深意等權威問答。
- **動態實體資料庫感知**：
  - 聊天引擎能感知當前宗族資訊（如自動識別「陳公廷玉」為開基祖、統計當前登錄之世代數與族人人數、直接查詢任意族人之生卒與世代詳情）。
- **雙模運作機制**：
  - **預設模式**：內建離線專家知識庫與語意關鍵字匹配引擎，無需任何外部 API Key 即可流暢即時回答。
  - **擴充模式**：支援管理員於設定中自訂 OpenAI 相容介面 API（如 OpenAI, DeepSeek, Ollama 等），自動注入宗族情境 Prompt 進行自然顧問對話。
- **前端對話介面 (`AIAssistantView.vue`)**：
  - 左側提供分類 FAQ 清單點擊即問；右側提供 Markdown 對話氣泡、推薦後續追問按鈕與對話紀錄清空功能。

---

