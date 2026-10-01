import db from '../db/connection.js';

export const FAQ_DATABASE = [
  {
    category: '祖先牌位與神主禮制',
    question: '什麼是「兩生合一老」？生老病死苦神數如何計算？',
    keywords: ['兩生合一老', '生老病死苦', '神數', '字數', '吉凶', '牌位字數', '牌位規定'],
    answer: `**「兩生合一老」神主牌位字數計算原則：**

傳統神主牌位講求文字字數合乎天地人倫之吉數，依「**生、老、病、死、苦**」五字天機循環計算：

- **計算方式**：純漢字字數除以 5 的餘數：
  - 餘 **1** ➔ **「生」**（吉）：象徵生生不息、枝繁葉茂。
  - 餘 **2** ➔ **「老」**（吉）：象徵長壽富貴、德高望重（**中行最宜**）。
  - 餘 **3** ➔ **「病」**（凶）：象徵多病凋零、體弱多厄。
  - 餘 **4** ➔ **「死」**（凶）：象徵斷絕終結，大凶之數。
  - 餘 **0** ➔ **「苦」**（凶）：象徵清苦勞碌、奔波艱辛。

**配置規範：**
1. **中行（主神位）**：必須落在 **「老」**（如 7、12、17、22 字）或 **「生」**（如 6、11、16、21 字）。民間最常見為 **12 字** 或 **17 字** 合「老」。
2. **左右行（生卒與奉祀）**：需合 **「生」** 或 **「老」**。
中行合「老」，左右行合「生」，三者合稱「兩生合一老」，象徵祖先得老、後代得生！`
  },
  {
    category: '祖先牌位與神主禮制',
    question: '男考（父親/男系先祖）的神位標準格式如何撰寫？',
    keywords: ['男考', '公', '府君', '男先人', '父親神位', '神主格式'],
    answer: `**男考神主標準格式：**

格式模板通常為：
\`顯考 [姓] 公 諱 [名] 府君 之神位\`（或 \`之神主\`）

- **字數範例**：
  - 例：\`顯考 陳 公 諱 廷玉 府君 之神位\` ➔ 共 **12 字**，除以 5 餘 2，合於 **「老」** 字（大吉）！
- **字義解說**：
  - **顯考**：對已故父親或祖父之尊稱（顯者，德操彰顯也）。
  - **公**：對男性長輩的尊稱。
  - **諱**：古人禮法名諱不可直呼，冠「諱」字表示尊敬。
  - **府君**：漢魏以來的尊稱，敬稱一家之主。
  - **之神位 / 之神主**：安座神靈受祭之所。`
  },
  {
    category: '祖先牌位與神主禮制',
    question: '女妣（母親/女系先祖）的神位標準格式如何撰寫？',
    keywords: ['女妣', '孺人', '母親神位', '氏', '女性先祖', '冠夫姓'],
    answer: `**女妣神主標準格式：**

格式模板通常為：
\`顯妣 [夫姓] 門 [本姓] 氏 諡 [諡號] 孺人 之神位\`
或未立諡號時：
\`顯妣 [夫姓] 門 [本姓] 氏 諱 [名] 孺人 之神位\`

- **字數範例**：
  - 例：\`顯妣 陳 門 林 氏 諡 純莊 孺人 之神位\` ➔ 共 **14 字** 犯死，可調整為：
    \`顯妣陳門林氏諡純莊孺人之神位主\` (15字苦) 或 \`顯妣林氏諡純莊孺人之神位\` (12字老，大吉)！
- **字義解說**：
  - **顯妣**：對已故母親之尊稱。
  - **孺人**：原為明清時期封贈命婦之階，民間普遍作為對賢良母親的高貴尊稱。
  - **氏**：母系本家之姓。`
  },
  {
    category: '祖先牌位與神主禮制',
    question: '牌位上方的「堂號」是什麼？陳氏、李氏、林氏的堂號是什麼？',
    keywords: ['堂號', '郡望', '穎川堂', '隴西堂', '西河堂', '堂號是什麼'],
    answer: `**何謂「堂號」與常見宗族堂號：**

「堂號」又稱郡望，源於魏晉南北朝世族門閥，記錄該姓氏最初發祥興盛的地理名望郡縣。刻於祖先牌位與宗祠樑坊，提醒子孫「飲水思源、莫忘根本」。

**常見百家姓堂號對照：**
- **陳氏**：穎川堂（潁川）、德星堂
- **李氏**：隴西堂、趙郡堂
- **林氏**：西河堂、問禮堂
- **黃氏**：江夏堂、紫雲堂
- **張氏**：清河堂、百忍堂
- **王氏**：太原堂、三槐堂
- **劉氏**：彭城堂
- **郭氏**：汾陽堂`
  },
  {
    category: '國農曆與干支八字',
    question: '十二時辰如何對應現代 24 小時制？',
    keywords: ['時辰', '十二時辰', '子丑寅卯', '時辰換算', '出生時間'],
    answer: `**十二時辰與 24 小時對照表：**

古人以地支紀時，一日分為十二時辰，一時辰合現代兩小時：
1. **子時**：23:00 - 01:00（三更，夜半）
2. **丑時**：01:00 - 03:00（四更，雞鳴）
3. **寅時**：03:00 - 05:00（五更，平旦）
4. **卯時**：05:00 - 07:00（日出，破曉）
5. **辰時**：07:00 - 09:00（食時，朝食）
6. **巳時**：09:00 - 11:00（隅中，臨午）
7. **午時**：11:00 - 13:00（日中，正午）
8. **未時**：13:00 - 15:00（日昳，日昃）
9. **申時**：15:00 - 17:00（晡時，夕食）
10. **酉時**：17:00 - 19:00（日入，傍晚）
11. **戌時**：19:00 - 21:00（一更，黃昏）
12. **亥時**：21:00 - 23:00（二更，人定）

*提示：在登錄族人生卒時，若確知出生鐘點，系統會自動匹配對應時辰八字。*`
  },
  {
    category: '族譜文化與世系編修',
    question: '何謂「行輩歌」或「字輩詩」？有何重要作用？',
    keywords: ['行輩歌', '字輩詩', '字輩', '派語', '行第', '命名字輩'],
    answer: `**何謂行輩詩（字輩歌）：**

「字輩」又稱行第、派語，是宗族始祖或賢長在創立基業時，親手譜寫的格言詩句（如四言、五言或七言絕句）。

**核心作用：**
1. **區別尊卑倫常**：後代子孫依世代順序以詩中一字命名（如本堂：廷、德、承、世、澤...），即使未曾謀面，一聽名字便知行輩尊卑。
2. **防止同族近親婚配**：在龐大聚落或遷徙海外時，確保昭穆不紊。
3. **千里尋親憑證**：散居各地的宗親相認時，只要對出相同字輩詩，即為同宗骨肉。`
  },
  {
    category: '系統操作指南',
    question: '如何在尋根系統中建立新族人與自動繪製世系樹？',
    keywords: ['如何建立', '新增成員', '世系樹怎麼畫', '操作教學', '如何使用'],
    answer: `**快速上手指南：**

1. **登錄族人檔案**：
   - 點擊頂部導航 **「登錄族人」**。
   - 填寫姓名、性別、世代世數。
   - 在「生身父親」與「生身母親」下拉選單中指定上一代先人（**極為關鍵**，系統依此建立世系母子父子鏈結）。
   - 選擇誕生與忌辰，可自由切換國曆或農曆。
2. **自動繪製家族世系樹**：
   - 點擊頂部 **「族譜世系圖」**。
   - 系統即時依據親屬父子母子關係自動遞迴計算，繪出動態階層拓樸樹狀圖，支援滑鼠拖曳、縮放與點擊「+/-」展開收合！
3. **一鍵製作牌位**：
   - 點擊任意先人節點的「牌位排版」，或至「牌位工作室」，系統將自動驗證生老病死苦並產出直書印稿！`
  }
];

/**
 * 取得當前宗族的實體即時數據上下文
 */
export function getClanContext() {
  const branch = db.prepare('SELECT * FROM family_branches LIMIT 1').get() || {};
  const members = db.prepare('SELECT * FROM people').all() || [];
  const deceased = members.filter(m => Boolean(m.solar_death_date || m.lunar_death_date));
  const tablets = db.prepare('SELECT * FROM tablet_records').all() || [];

  const maxGen = members.length ? Math.max(...members.map(m => m.generation_num || 1)) : 0;

  return {
    familyName: branch.family_name || '宗族',
    hallName: branch.hall_name || '堂上',
    progenitor: branch.progenitor || '開基始祖',
    generationPoem: branch.generation_poem || '暫未設定字輩詩',
    description: branch.description || '',
    totalMembersCount: members.length,
    deceasedCount: deceased.length,
    livingCount: members.length - deceased.length,
    maxGeneration: maxGen,
    tabletsCount: tablets.length,
    members: members.map(m => ({
      id: m.id,
      name: `${m.last_name}${m.first_name}`,
      generation: m.generation_num,
      generationName: m.generation_name,
      courtesyName: m.courtesy_name,
      gender: m.gender === 'M' ? '男' : '女',
      birthDate: m.lunar_birth_date || m.solar_birth_date,
      deathDate: m.lunar_death_date || m.solar_death_date,
      isDeceased: Boolean(m.solar_death_date || m.lunar_death_date)
    }))
  };
}

/**
 * 本地智能問答與語意匹配器 (無須外部 API 即可順暢運作)
 */
export function queryBuiltInAssistant(userMessage) {
  const q = userMessage.trim().toLowerCase();
  const context = getClanContext();

  // 1. 檢查是否詢問當前資料庫的宗族即時狀態
  if (q.includes('開基祖') || q.includes('始祖') || q.includes('一世祖')) {
    return {
      reply: `本宗族（**${context.familyName}**，堂號：**${context.hallName}**）之開基始祖為 **${context.progenitor}**。\n\n宗族世系源流記載：\n> ${context.description || '暫無源流介紹'}\n\n目前世系已登錄至第 **${context.maxGeneration}** 世。`,
      suggestions: ['查看世系圖譜', '查詢字輩詩', '什麼是兩生合一老？'],
      category: '宗族實體資訊'
    };
  }

  if (q.includes('人數') || q.includes('幾個人') || q.includes('統計') || q.includes('幾代') || q.includes('代數')) {
    return {
      reply: `**當前宗族世系數位典藏統計概況：**\n\n- **宗族總名稱**：${context.familyName}（${context.hallName}）\n- **登錄總人數**：${context.totalMembersCount} 位\n- **歷代傳承代數**：共 ${context.maxGeneration} 世\n- **歷代先祖 (已仙逝)**：${context.deceasedCount} 位\n- **裔孫子嗣 (健在)**：${context.livingCount} 位\n- **已完成排版牌位數**：${context.tabletsCount} 座`,
      suggestions: ['查看族人名冊', '製作祖先牌位', '如何匯出全庫備份？'],
      category: '宗族即時統計'
    };
  }

  if (q.includes('字輩') || q.includes('輩序') || q.includes('行輩') || q.includes('派語')) {
    return {
      reply: `**本堂世代輩序詩（行輩歌）：**\n\n> 📜 **「${context.generationPoem}」**\n\n本堂族人命名時，依輩序詩中文字作為行輩標誌，區別世系尊卑，世代傳承。`,
      suggestions: ['誰是開基祖？', '查看族人世系圖', '如何登錄新族人？'],
      category: '宗族字輩詩'
    };
  }

  // 2. 檢查是否詢問特定先人姓名
  for (const m of context.members) {
    if (q.includes(m.name.toLowerCase()) || (m.courtesyName && q.includes(m.courtesyName.toLowerCase()))) {
      return {
        reply: `**族人檔案資訊：${m.name}**\n\n- **世代世數**：第 ${m.generation} 世${m.generationName ? `（「${m.generationName}」字輩）` : ''}\n- **性別**：${m.gender}\n- **字號**：${m.courtesyName || '無記載'}\n- **生辰**：${m.birthDate || '未記載'}\n- **仙逝**：${m.deathDate ? m.deathDate : '健在'}\n- **當前狀態**：${m.isDeceased ? '已仙逝先人' : '健在裔孫'}\n\n您可前往「族譜世系圖」查看其上下世代關聯，或至「牌位工作室」為其排版神主牌位。`,
        suggestions: [`為 ${m.name} 排版牌位`, '查看世系圖譜', '回到宗族統計'],
        category: '成員檔案查詢'
      };
    }
  }

  // 3. 搜尋專業知識庫 (FAQ)
  let bestMatch = null;
  let highestScore = 0;

  for (const faq of FAQ_DATABASE) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (q.includes(kw.toLowerCase())) {
        score += kw.length;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && highestScore > 0) {
    return {
      reply: bestMatch.answer,
      suggestions: ['何謂行輩詩？', '男考神主怎麼寫？', '女妣神主怎麼寫？', '查詢宗族統計'],
      category: bestMatch.category
    };
  }

  // 4. 通用引導回答
  return {
    reply: `您好！我是「**尋根系統 AI 助手**」，專注於解答祖先牌位禮制規範、國農曆干支換算、傳統族譜世系知識與系統操作。\n\n**常見問題推薦：**\n1. 什麼是「兩生合一老」字數計算？\n2. 男考與女妣的神位格式該如何撰寫？\n3. 本宗族的堂號與開基祖是誰？\n4. 十二時辰與 24 小時如何對照？\n5. 如何登錄族人並自動畫出世系圖？\n\n請隨時點選上方建議或直接提出您的問題！`,
    suggestions: [
      '什麼是兩生合一老？',
      '查詢開基祖資訊',
      '男考神主怎麼寫？',
      '女妣神主怎麼寫？',
      '十二時辰對照表'
    ],
    category: '通用指引'
  };
}
