# 尋根系統（FindRoot）：開發任務清單 (TASK_LIST.md)

本文件依據 [SPEC.md](file:///home/coder/Codebase/FindRoot/SPEC.md) 規劃之系統規格，拆解為具體執行的階段性開發任務。每個任務均包含明確驗收標準與相依性。

---

## 專案進度總覽

- [x] **階段一：專案基底與環境初始化 (Project Setup)**（已完成）
- [x] **階段二：後端核心與 SQLite 資料庫建構 (Backend & Database)**（已完成）
- [x] **階段三：曆法轉換與牌位格式化核心模組 (Calendar & Tablet Engine)**（已完成）
- [x] **階段四：前端基礎介面與族人管理 (Frontend UI & Member Management)**（已完成）
- [x] **階段五：世系圖與族譜視覺化 (Genealogy Tree Visualization)**（已完成）
- [x] **階段六：祖先牌位工作室與列印排版 (Tablet Studio & Printing)**（已完成）
- [x] **階段七：系統備份還原與整合驗證 (Backup, Verification & Release)**（已完成）
- [x] **階段八：使用者註冊、認證與管理員權限體系 (User Auth & Admin Control)**（已完成）
- [x] **階段九：LLM 智慧禮制問答助手與 FAQ 知識庫 (AI Assistant & Knowledge Base)**（已完成）
- [x] **階段十：Awwwards / Webby / FWA 級前端視覺美學與互動體驗革新 (Award-Grade UX/UI)**（已完成）

---

## 階段一：專案基底與環境初始化 (Project Setup)

- [x] **1.1 初始化根目錄與 Monorepo 結構**
  - [x] 建立 `backend` 與 `frontend` 子目錄。
  - [x] 配置根目錄 `package.json`（設定並行啟動腳本 `npm run dev`）。
  - [x] 配置 `.gitignore`（忽略 `node_modules`、`.sqlite`、產生的暫存檔）。
- [x] **1.2 建構後端 Node.js 開發環境**
  - [x] 初始化 `backend/package.json`。
  - [x] 安裝核心套件：`express`, `cors`, `better-sqlite3`, `lunar-javascript`, `uuid`, `dotenv`。
  - [x] 設定開發伺服器入口與熱重載支援。
- [x] **1.3 建構前端 Vue 3 開發環境**
  - [x] 使用 Vite 建立 Vue 3 專案（支援 Composition API 與 `<script setup>`）。
  - [x] 配置 Tailwind CSS 並建立古典東方配色及排版規範。
  - [x] 安裝輔助套件：`lunar-javascript`, `d3`, `lucide-vue-next`。

---

## 階段二：後端核心與 SQLite 資料庫建構 (Backend & Database)

- [x] **2.1 資料庫 Schema 設計與初始化**
  - [x] 撰寫 SQLite 資料庫初始化腳本（`backend/src/db/init.js`）。
  - [x] 建立 `family_branches` 資料表（宗族基本資料、堂號、字輩歌）。
  - [x] 建立 `people` 資料表（個人資訊、生卒、國農曆、時辰、安葬地）。
  - [x] 建立 `relationships` 資料表（父母、配偶、承嗣關係）。
  - [x] 建立 `tablet_records` 資料表（牌位排版與自訂配置儲存）。
  - [x] 提供四代完整示範種子資料（穎川陳氏 11 位成員世系）。
- [x] **2.2 成員管理 RESTful API**
  - [x] `GET /api/v1/members`：分頁查詢與模糊搜尋（姓名、世代、字輩）。
  - [x] `GET /api/v1/members/:id`：取得成員個人生平、雙親、配偶與子女清單。
  - [x] `POST /api/v1/members`：新增成員並可同時指定父母/配偶關係。
  - [x] `PUT /api/v1/members/:id`：更新成員生平資訊。
  - [x] `DELETE /api/v1/members/:id`：刪除成員並防呆檢查世系關聯孤兒節點。
- [x] **2.3 親屬關聯 API**
  - [x] `POST /api/v1/genealogy/relationship`：新增/修改親屬關係（FATHER, MOTHER, SPOUSE...）。
  - [x] `DELETE /api/v1/genealogy/relationship/:id`：移除特定親屬關聯。
  - [x] `GET /api/v1/genealogy/tree`：以指定族人為起點，組裝遞迴階層樹狀 JSON 資料。

---

## 階段三：曆法轉換與牌位格式化核心模組 (Calendar & Tablet Engine)

- [x] **3.1 國曆/農曆/干支雙向換算模組**
  - [x] 實作國曆轉農曆演算法：傳入西元年月日與時辰，回傳農曆年月日時、閏月旗標、干支八字、生肖。
  - [x] 實作農曆轉國曆演算法：傳入農曆年月日（支援閏月），精準回傳西元日期。
  - [x] 實作歷史朝代與民國紀年換算函式。
  - [x] 建立 API 路由：`POST /api/v1/calendar/solar-to-lunar`、`POST /api/v1/calendar/lunar-to-solar`。
- [x] **3.2 祖先牌位排版與「兩生合一老」字數驗證器**
  - [x] 實作「生、老、病、死、苦」字數計算函數（餘數檢核模組）。
  - [x] 實作男考標準格式模板生成（`顯考 [姓] 公 諱 [名] 府君 之神位`）。
  - [x] 實作女妣標準格式模板生成（`顯妣 [姓] 門 [本姓] 氏 諡 [諡號] 孺人 之神位`）。
  - [x] 實作字數校驗與修正建議提示邏輯（若字數合病死苦，建議補字如「府君」、「公」、「諱」或減字）。
  - [x] 建立 API 路由：`POST /api/v1/tablet/format`、`POST /api/v1/tablet/validate`。

---

## 階段四：前端基礎介面與族人管理 (Frontend UI & Member Management)

- [x] **4.1 系統主佈局與導覽設計**
  - [x] 建立具東方文雅氣質與現代簡潔兼具之側邊欄或頂部導航（儀表板、成員列表、族譜世系圖、牌位工作室、宗族設定）。
  - [x] 建立 API Service 模組封裝與錯誤處理提示。
- [x] **4.2 族人生平表單與「國農曆雙向切換選取器」元件**
  - [x] 實作 `LunarDatePicker.vue`：
    - 國曆/農曆 Tab 切換。
    - 選擇國曆即時連動預覽農曆年月日時辰。
    - 選擇農曆可勾選是否閏月，並可選擇子丑寅卯十二時辰。
  - [x] 實作成員新增/編輯抽屜表單（基本名諱、字輩、世代、生卒日、時辰、安葬地、父母與配偶設定）。
- [x] **4.3 族人清單檢索 (MemberList)**
  - [x] 表格模式展示。
  - [x] 支援依姓名、世代、性別篩選與快速搜尋。
  - [x] 支援從成員列表一鍵導向「查看世系圖」與「產生牌位」。

---

## 階段五：世系圖與族譜視覺化 (Genealogy Tree Visualization)

- [x] **5.1 族譜互動世系圖（Family Tree View）**
  - [x] 實作層級樹狀世系圖排版。
  - [x] 支援節點資訊呈現：世代、姓名、性別、生卒年（含干支）、配偶註記。
  - [x] 支援互動手勢：畫布縮放（Zoom）、平移（Pan）、點擊節點展開/收合子孫節點。
  - [x] 支援節點點擊彈出個人生平摘要卡與編輯跳轉。
- [x] **5.2 世代切換與尋根路徑**
  - [x] 支援切換指定族人為「世系根節點（始祖/開基祖）」。
  - [x] 支援生平檔案詳情查閱與一鍵跳轉製作神主牌位。

---

## 階段六：祖先牌位工作室與列印排版 (Tablet Studio & Printing)

- [x] **6.1 牌位排版工作室介面 (TabletStudio.vue)**
  - [x] 選擇特定族人，自動帶入生卒、名諱並產生預設排版。
  - [x] 直書直排渲染（CSS `writing-mode: vertical-rl`），模擬傳統木紋金字。
  - [x] 即時字數統計與「兩生合一老」吉凶檢查燈號：
    - 中行字數檢核（合「老」或「生」顯示綠色通過，合「病死苦」顯示橘色警示並提供建議字詞）。
    - 左右行字數檢核。
- [x] **6.2 牌位樣式切換與實體列印排版**
  - [x] 支援傳統紅木金字、沉香黑檀金字、白底列印紙樣切換。
  - [x] 支援已儲存牌位清單載入、修改與刪除。
  - [x] 支援一鍵呼叫瀏覽器列印紙樣。

---

## 階段七：系統備份還原與整合驗證 (Backup, Verification & Release)

- [x] **7.1 資料匯出與備份功能**
  - [x] 支援完整族譜資料一鍵匯出為 JSON 格式。
  - [x] 支援上傳 JSON 進行資料庫覆寫或合併還原。
  - [x] 宗族基本設定介面（設定堂號、開基祖、世代輩序詩）。
  - [x] 支援示範資料單鍵重置。
- [x] **7.2 全流程端到端測試與驗證**
  - [x] 驗證國農曆轉換極端案例（閏月、時辰交界）。
  - [x] 驗證親屬關係遞迴組裝。
  - [x] 驗證牌位字數檢核規則在各式名諱長度下的正確性。
- [x] **7.3 撰寫系統操作指南 (README.md)** 與 **使用情境案例 (USECASE.md)**。

---

## 階段八：使用者註冊、認證與管理員權限體系 (User Auth & Admin Control)

- [x] **8.1 資料庫設計與種子帳號**
  - [x] 建立 `users` 資料表（支援 bcrypt 密碼雜湊與 admin/user 角色）。
  - [x] 預設建立系統管理員 (`admin`/`admin123`) 與示範宗親會員 (`clan_member`/`user123`)。
- [x] **8.2 後端認證與管理員控制 API**
  - [x] `POST /api/v1/auth/register`：會員註冊。
  - [x] `POST /api/v1/auth/login`：JWT 登入簽發。
  - [x] `GET /api/v1/auth/me`：取得當前登入者資訊。
  - [x] `GET /api/v1/admin/users`：管理員列出所有使用者。
  - [x] `PUT /api/v1/admin/users/:id/role`：調整使用者身分組。
  - [x] `PUT /api/v1/admin/users/:id/status`：啟用/停用使用者帳號。
  - [x] `DELETE /api/v1/admin/users/:id`：刪除使用者帳號。
- [x] **8.3 前端會員認證與管理員控制面板**
  - [x] 實作 `AuthModal.vue`（支援登入與註冊切換、示範帳號一鍵填入）。
  - [x] 頂部導覽列會員身分徽章與登出功能。
  - [x] 設定頁面管理員專屬「宗親會員帳號與權限管理」控制台。

---

## 階段九：LLM 智慧禮制問答助手與 FAQ 知識庫 (AI Assistant & Knowledge Base)

- [x] **9.1 禮制民俗知識庫與動態資料庫感知**
  - [x] 建置權威 FAQ 知識庫（「兩生合一老」字數計算、男女神主標準稱謂、堂號淵源、十二時辰對照、字輩歌作用）。
  - [x] 實作資料庫動態感知引擎（查詢當前開基祖、登錄代數與人數、特定先人生平資訊）。
- [x] **9.2 後端智能問答 API 與彈性外部 LLM 介接**
  - [x] 實作 `POST /api/v1/llm/chat` 聊天問答端點（優先使用內建離線知識庫，亦支援外部 OpenAI 相容 API）。
  - [x] 實作 `GET /api/v1/llm/faq` 與 `PUT /api/v1/llm/config`。
- [x] **9.3 前端 AI 智慧助手視圖 (`AIAssistantView.vue`)**
  - [x] 提供左側 FAQ 分類快捷選單與一鍵提問。
  - [x] 實作互動式聊天氣泡流、Markdown 重點樣式渲染與後續推薦問題按鈕。
  - [x] 支援管理員彈窗自訂外部 LLM 連線配置。

---

## 階段十：Awwwards / Webby / FWA 級前端視覺美學與互動體驗革新 (Award-Grade UX/UI)

- [x] **10.1 宮廷東方非遺設計系統建置**
  - [x] 引入傳統書法名家字體（Ma Shan Zheng）與精緻思源宋體，訂製高解析篆刻硃砂「根」字 Favicon。
  - [x] 擴充 Tailwind 色彩語義體系（硃砂紅、宮廷泥金、老紅木、沉香黑檀、古籍宣紙米白）。
  - [x] 實作全域宣紙底紋（Xuan Paper Texture）、金箔流光（Gold Shimmer）、回紋飾角（Ornate Card）與金字浮雕（`gold-text-emboss`）。
- [x] **10.2 典藏級 3D 浮雕祖先牌位與五德天體羅盤**
  - [x] 重構 `TabletPreview.vue`：加入頂部牌頭祥雲螭龍雕飾、雷雕堂號匾額、多層須彌蓮花座（仰覆蓮花台）與 3D 陰影厚度。
  - [x] 打造 `FiveFateCompass.vue`：環形 SVG 儀表天體羅盤，即時運算「生老病死苦」相位、弧度指標與魯班尺文公尺吉數規矩指南。
  - [x] 整合 `TabletStudioView.vue`：無縫聯動 3D 牌位刻工、羅盤運轉與一鍵依禮補字。
- [x] **10.3 古典雅樂聲學合成引擎 (Web Audio API)**
  - [x] 實作 `src/utils/audio.js`：零外部資產依賴，純數學合成宮商角徵羽五音磬鐘與古琴餘韻（523Hz～880Hz）。
  - [x] 於頂部導覽列提供雅樂開關（`Navbar.vue` 磬鈴按鈕）。
  - [x] 於族人探詢、牌位刻立、AI 請益答覆等觸發節點提供清逸悠長的音效反饋。
- [x] **10.4 絲綢卷軸世系族譜與文淵閣學者工作室**
  - [x] 重構 `FamilyTree.vue` 與 `TreeNode.vue`：古典絲綢底紋、水墨世系印璽、竹簡玉牒卡片、金色高亮巡歷與族人搜尋 HUD 控制列。
  - [x] 升級 `AIAssistantView.vue` 與 `MemberListView.vue`：文淵閣書齋陳設、硃砂印章標章、昭穆玉牒檔案與雅樂聯動。
- [x] **10.5 跨裝置自適應、60FPS 流暢動畫與 Vite 生產建置驗證**
  - [x] 修正 CSS 規格相容性，達成零報錯、超輕量 Gzip 產出（`dist/` 編譯通過）。
