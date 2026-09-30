import db from './connection.js';
import { v4 as uuidv4 } from 'uuid';
import { convertSolarToLunar } from '../utils/calendar.js';

export function initializeDatabase() {
  console.log('正在初始化 SQLite 資料表...');

  // 宗族分支與堂號設定表
  db.exec(`
    CREATE TABLE IF NOT EXISTS family_branches (
      id TEXT PRIMARY KEY,
      family_name TEXT NOT NULL,
      hall_name TEXT NOT NULL,
      progenitor TEXT,
      generation_poem TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 族人成員基本生平與生卒資料表
  db.exec(`
    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      branch_id TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      courtesy_name TEXT,
      posthumous_name TEXT,
      generation_name TEXT,
      generation_num INTEGER DEFAULT 1,
      gender TEXT CHECK(gender IN ('M', 'F', '男', '女')) NOT NULL,
      order_in_family TEXT,
      solar_birth_date TEXT,
      lunar_birth_date TEXT,
      is_birth_leap INTEGER DEFAULT 0,
      birth_time_branch TEXT,
      solar_death_date TEXT,
      lunar_death_date TEXT,
      is_death_leap INTEGER DEFAULT 0,
      death_time_branch TEXT,
      burial_location TEXT,
      biography TEXT,
      avatar_url TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES family_branches(id) ON DELETE SET NULL
    );
  `);

  // 親屬關係鏈結表 (支援父母、配偶、出嗣過繼等)
  db.exec(`
    CREATE TABLE IF NOT EXISTS relationships (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      related_person_id TEXT NOT NULL,
      relation_type TEXT NOT NULL CHECK(relation_type IN ('FATHER', 'MOTHER', 'SPOUSE', 'CHILD', 'ADOPTED_FATHER', 'ADOPTED_MOTHER')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
      FOREIGN KEY (related_person_id) REFERENCES people(id) ON DELETE CASCADE
    );
  `);

  // 牌位紀錄與排版設定表
  db.exec(`
    CREATE TABLE IF NOT EXISTS tablet_records (
      id TEXT PRIMARY KEY,
      person_id TEXT,
      hall_name TEXT,
      middle_text TEXT NOT NULL,
      right_text TEXT,
      left_text TEXT,
      middle_count INTEGER,
      right_count INTEGER,
      left_count INTEGER,
      middle_fate TEXT,
      custom_style TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE SET NULL
    );
  `);

  // 建立索引以強化查詢效率
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_people_names ON people(last_name, first_name);
    CREATE INDEX IF NOT EXISTS idx_people_generation ON people(generation_num);
    CREATE INDEX IF NOT EXISTS idx_rel_person ON relationships(person_id);
    CREATE INDEX IF NOT EXISTS idx_rel_related ON relationships(related_person_id);
    CREATE INDEX IF NOT EXISTS idx_tablet_person ON tablet_records(person_id);
  `);

  console.log('資料表建立完成。檢查是否需要灌入範例種子資料...');

  const branchCount = db.prepare('SELECT COUNT(*) as count FROM family_branches').get().count;
  if (branchCount === 0) {
    seedInitialData();
  } else {
    console.log('資料庫中已有資料，略過種子灌入。');
  }
}

/**
 * 預設種子資料灌入（建立四代傳承範例宗族：穎川陳氏）
 */
function seedInitialData() {
  console.log('開始灌入穎川陳氏示範族譜與祖先牌位種子資料...');

  const branchId = 'branch-chen-01';
  db.prepare(`
    INSERT INTO family_branches (id, family_name, hall_name, progenitor, generation_poem, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    branchId,
    '穎川陳氏宗族',
    '穎川堂',
    '陳公廷玉',
    '廷德承世澤 忠孝裕家聲 詩書光祖烈 仁義慶和平',
    '原籍福建泉州同安，清乾隆年間渡海遷台開基，世代農耕經商，家風敦厚。'
  );

  // 四代示範家族成員
  // 第一代：高祖父 (陳廷玉) & 高祖母 (林滿)
  const g1_father_id = 'person-g1-01';
  const g1_mother_id = 'person-g1-02';

  // 第二代：曾祖父 (陳德發) & 曾祖母 (張阿妹)
  const g2_father_id = 'person-g2-01';
  const g2_mother_id = 'person-g2-02';

  // 第三代：祖父 (陳承宗) & 祖母 (李秀琴)
  const g3_father_id = 'person-g3-01';
  const g3_mother_id = 'person-g3-02';
  // 第三代：叔公 (陳承耀)
  const g3_brother_id = 'person-g3-03';

  // 第四代：父親 (陳世華) & 母親 (王雅惠)
  const g4_father_id = 'person-g4-01';
  const g4_mother_id = 'person-g4-02';
  // 第四代：姑姑 (陳美蘭)
  const g4_sister_id = 'person-g4-03';

  // 第五代：本人 (陳澤遠)
  const g5_me_id = 'person-g5-01';

  const insertPerson = db.prepare(`
    INSERT INTO people (
      id, branch_id, first_name, last_name, courtesy_name, posthumous_name,
      generation_name, generation_num, gender, order_in_family,
      solar_birth_date, lunar_birth_date, is_birth_leap, birth_time_branch,
      solar_death_date, lunar_death_date, is_death_leap, death_time_branch,
      burial_location, biography, notes
    ) VALUES (
      @id, @branch_id, @first_name, @last_name, @courtesy_name, @posthumous_name,
      @generation_name, @generation_num, @gender, @order_in_family,
      @solar_birth_date, @lunar_birth_date, @is_birth_leap, @birth_time_branch,
      @solar_death_date, @lunar_death_date, @is_death_leap, @death_time_branch,
      @burial_location, @biography, @notes
    )
  `);

  const members = [
    // G1
    {
      id: g1_father_id, branch_id: branchId, last_name: '陳', first_name: '廷玉', courtesy_name: '溫如', posthumous_name: '純厚',
      generation_name: '廷', generation_num: 1, gender: 'M', order_in_family: '長男',
      solar_birth_date: '1868-04-12', lunar_birth_date: '戊辰年三月二十', is_birth_leap: 0, birth_time_branch: '辰',
      solar_death_date: '1942-08-15', lunar_death_date: '壬午年七月初四', is_death_leap: 0, death_time_branch: '未',
      burial_location: '新北三峽大埔山麓 坐北朝南', biography: '開基一世祖，為人勤懇敦厚，攜族人拓墾茶園。', notes: '開基祖'
    },
    {
      id: g1_mother_id, branch_id: branchId, last_name: '林', first_name: '滿', courtesy_name: '', posthumous_name: '慈莊',
      generation_name: '', generation_num: 1, gender: 'F', order_in_family: '次女',
      solar_birth_date: '1872-09-05', lunar_birth_date: '壬申年八月初三', is_birth_leap: 0, birth_time_branch: '巳',
      solar_death_date: '1948-11-20', lunar_death_date: '戊子年十月二十', is_death_leap: 0, death_time_branch: '午',
      burial_location: '三峽大埔合葬', biography: '勤儉持家，佐夫創立基業。', notes: ''
    },
    // G2
    {
      id: g2_father_id, branch_id: branchId, last_name: '陳', first_name: '德發', courtesy_name: '明達', posthumous_name: '安勤',
      generation_name: '德', generation_num: 2, gender: 'M', order_in_family: '長男',
      solar_birth_date: '1895-03-20', lunar_birth_date: '乙未年二月廿四', is_birth_leap: 0, birth_time_branch: '卯',
      solar_death_date: '1965-10-10', lunar_death_date: '乙巳年九月十六', is_death_leap: 0, death_time_branch: '申',
      burial_location: '樹林第七公墓 座東朝西', biography: '經營米糧商號，興辦私塾助族內後進。', notes: ''
    },
    {
      id: g2_mother_id, branch_id: branchId, last_name: '張', first_name: '阿妹', courtesy_name: '', posthumous_name: '端肅',
      generation_name: '', generation_num: 2, gender: 'F', order_in_family: '長女',
      solar_birth_date: '1898-07-14', lunar_birth_date: '戊戌年五月廿六', is_birth_leap: 0, birth_time_branch: '未',
      solar_death_date: '1970-03-08', lunar_death_date: '庚戌年二月初一', is_death_leap: 0, death_time_branch: '戌',
      burial_location: '樹林第七公墓合葬', biography: '溫婉柔順，深得族人愛戴。', notes: ''
    },
    // G3
    {
      id: g3_father_id, branch_id: branchId, last_name: '陳', first_name: '承宗', courtesy_name: '繼賢', posthumous_name: '正直',
      generation_name: '承', generation_num: 3, gender: 'M', order_in_family: '長男',
      solar_birth_date: '1924-06-18', lunar_birth_date: '甲子年五月十七', is_birth_leap: 0, birth_time_branch: '午',
      solar_death_date: '1998-12-05', lunar_death_date: '戊寅年十月十七', is_death_leap: 0, death_time_branch: '酉',
      burial_location: '八里觀音山龍形示範墓園', biography: '師範學校畢業，任職教職三十載，春風化雨。', notes: ''
    },
    {
      id: g3_mother_id, branch_id: branchId, last_name: '李', first_name: '秀琴', courtesy_name: '', posthumous_name: '淑懿',
      generation_name: '', generation_num: 3, gender: 'F', order_in_family: '三女',
      solar_birth_date: '1928-11-02', lunar_birth_date: '戊辰年九月廿一', is_birth_leap: 0, birth_time_branch: '子',
      solar_death_date: '2012-05-19', lunar_death_date: '壬辰年閏四月廿九', is_death_leap: 1, death_time_branch: '巳',
      burial_location: '三芝真龍殿骨灰蓮位', biography: '相夫教子，虔誠向佛。', notes: ''
    },
    {
      id: g3_brother_id, branch_id: branchId, last_name: '陳', first_name: '承耀', courtesy_name: '顯光', posthumous_name: '',
      generation_name: '承', generation_num: 3, gender: 'M', order_in_family: '次男',
      solar_birth_date: '1930-08-08', lunar_birth_date: '庚午年閏六月十四', is_birth_leap: 1, birth_time_branch: '辰',
      solar_death_date: '2005-02-14', lunar_death_date: '乙酉年正月初六', is_death_leap: 0, death_time_branch: '亥',
      burial_location: '陽明山公墓', biography: '熱心地方公益，任宗親會總幹事。', notes: ''
    },
    // G4
    {
      id: g4_father_id, branch_id: branchId, last_name: '陳', first_name: '世華', courtesy_name: '文彬', posthumous_name: '',
      generation_name: '世', generation_num: 4, gender: 'M', order_in_family: '長男',
      solar_birth_date: '1956-09-28', lunar_birth_date: '丙申年八月廿四', is_birth_leap: 0, birth_time_branch: '巳',
      solar_death_date: '', lunar_death_date: '', is_death_leap: 0, death_time_branch: '',
      burial_location: '', biography: '工科大學畢業，投身資訊電子產業創立事業。', notes: '現任家長'
    },
    {
      id: g4_mother_id, branch_id: branchId, last_name: '王', first_name: '雅惠', courtesy_name: '', posthumous_name: '',
      generation_name: '', generation_num: 4, gender: 'F', order_in_family: '長女',
      solar_birth_date: '1960-03-15', lunar_birth_date: '庚子年二月十八', is_birth_leap: 0, birth_time_branch: '卯',
      solar_death_date: '', lunar_death_date: '', is_death_leap: 0, death_time_branch: '',
      burial_location: '', biography: '喜愛國畫花藝，賢良淑德。', notes: ''
    },
    {
      id: g4_sister_id, branch_id: branchId, last_name: '陳', first_name: '美蘭', courtesy_name: '', posthumous_name: '',
      generation_name: '世', generation_num: 4, gender: 'F', order_in_family: '長女',
      solar_birth_date: '1962-12-10', lunar_birth_date: '壬寅年十一月十四', is_birth_leap: 0, birth_time_branch: '酉',
      solar_death_date: '', lunar_death_date: '', is_death_leap: 0, death_time_branch: '',
      burial_location: '', biography: '醫護背景，長年服務於教學醫院。', notes: ''
    },
    // G5
    {
      id: g5_me_id, branch_id: branchId, last_name: '陳', first_name: '澤遠', courtesy_name: '致達', posthumous_name: '',
      generation_name: '澤', generation_num: 5, gender: 'M', order_in_family: '長男',
      solar_birth_date: '1988-10-25', lunar_birth_date: '戊辰年九月十五', is_birth_leap: 0, birth_time_branch: '午',
      solar_death_date: '', lunar_death_date: '', is_death_leap: 0, death_time_branch: '',
      burial_location: '', biography: '軟體工程師，致力於家族文史數位化保存。', notes: '本譜修訂者'
    }
  ];

  for (const m of members) {
    insertPerson.run(m);
  }

  // 插入親屬關聯 (relationships)
  const insertRel = db.prepare(`
    INSERT INTO relationships (id, person_id, related_person_id, relation_type, notes)
    VALUES (?, ?, ?, ?, ?)
  `);

  const relations = [
    // G1 配偶
    [uuidv4(), g1_father_id, g1_mother_id, 'SPOUSE', '結髮夫妻'],
    [uuidv4(), g1_mother_id, g1_father_id, 'SPOUSE', '結髮夫妻'],

    // G2 的父母與配偶
    [uuidv4(), g2_father_id, g1_father_id, 'FATHER', '父親'],
    [uuidv4(), g2_father_id, g1_mother_id, 'MOTHER', '母親'],
    [uuidv4(), g2_father_id, g2_mother_id, 'SPOUSE', '元配'],
    [uuidv4(), g2_mother_id, g2_father_id, 'SPOUSE', '元配'],

    // G3 的父母與配偶
    [uuidv4(), g3_father_id, g2_father_id, 'FATHER', '父親'],
    [uuidv4(), g3_father_id, g2_mother_id, 'MOTHER', '母親'],
    [uuidv4(), g3_father_id, g3_mother_id, 'SPOUSE', '元配'],
    [uuidv4(), g3_mother_id, g3_father_id, 'SPOUSE', '元配'],
    // 叔公
    [uuidv4(), g3_brother_id, g2_father_id, 'FATHER', '父親'],
    [uuidv4(), g3_brother_id, g2_mother_id, 'MOTHER', '母親'],

    // G4 的父母與配偶
    [uuidv4(), g4_father_id, g3_father_id, 'FATHER', '父親'],
    [uuidv4(), g4_father_id, g3_mother_id, 'MOTHER', '母親'],
    [uuidv4(), g4_father_id, g4_mother_id, 'SPOUSE', '元配'],
    [uuidv4(), g4_mother_id, g4_father_id, 'SPOUSE', '元配'],
    [uuidv4(), g4_sister_id, g3_father_id, 'FATHER', '父親'],
    [uuidv4(), g4_sister_id, g3_mother_id, 'MOTHER', '母親'],

    // G5 的父母
    [uuidv4(), g5_me_id, g4_father_id, 'FATHER', '父親'],
    [uuidv4(), g5_me_id, g4_mother_id, 'MOTHER', '母親']
  ];

  for (const r of relations) {
    insertRel.run(...r);
  }

  // 插入示範祖先牌位紀錄
  const insertTablet = db.prepare(`
    INSERT INTO tablet_records (
      id, person_id, hall_name, middle_text, right_text, left_text,
      middle_count, right_count, left_count, middle_fate, custom_style
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 高祖父牌位：顯考陳公諱廷玉府君之神位 (12字，合老，大吉)
  insertTablet.run(
    uuidv4(),
    g1_father_id,
    '穎川堂',
    '顯考陳公諱廷玉府君之神位',
    '生於戊辰年三月二十辰時 卒於壬午年七月初四未時',
    '陽上孝男德發 裔孫等奉祀',
    12,
    23,
    12,
    '老',
    JSON.stringify({ fontSize: 'large', frame: 'gold' })
  );

  // 曾祖父牌位：顯考陳公諱德發府君之神位 (12字，合老，大吉)
  insertTablet.run(
    uuidv4(),
    g2_father_id,
    '穎川堂',
    '顯考陳公諱德發府君之神位',
    '生於乙未年二月廿四卯時 卒於乙巳年九月十六申時',
    '陽上孝男承宗 裔孫奉祀',
    12,
    23,
    11,
    '老',
    JSON.stringify({ fontSize: 'large', frame: 'gold' })
  );

  console.log('示範資料灌入完畢！');
}

// 支援命令列直接執行初始化
if (process.argv[1] && process.argv[1].endsWith('init.js')) {
  initializeDatabase();
}
