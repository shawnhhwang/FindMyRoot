/**
 * 祖先牌位演算法與生老病死苦格式化工具
 * 依據民間神主牌位習俗：
 * 生 (1, 6, 11, 16, 21...) - 吉
 * 老 (2, 7, 12, 17, 22...) - 吉
 * 病 (3, 8, 13, 18, 23...) - 凶
 * 死 (4, 9, 14, 19, 24...) - 凶
 * 苦 (5, 10, 15, 20, 25...) - 凶
 */

export const FATE_CYCLE = [
  { index: 1, name: '生', isAuspicious: true, meaning: '生生不息，子孫昌盛' },
  { index: 2, name: '老', isAuspicious: true, meaning: '長壽富貴，德高望重' },
  { index: 3, name: '病', isAuspicious: false, meaning: '多病衰微，諸事不吉' },
  { index: 4, name: '死', isAuspicious: false, meaning: '終結斷絕，大凶之相' },
  { index: 0, name: '苦', isAuspicious: false, meaning: '奔波勞碌，清苦艱難' }
];

/**
 * 清除字串中非中文字符與空白，計算純字數
 */
export function cleanTextCount(text = '') {
  if (!text) return 0;
  // 去除所有空格、標點符號與換行
  const cleaned = text.replace(/[\s\r\n\t，。、；：！!？?·]/g, '');
  return cleaned.length;
}

/**
 * 依據字數檢驗所落生老病死苦神數
 */
export function evaluateFate(count) {
  if (count <= 0) {
    return { count: 0, name: '無', isAuspicious: false, remainder: 0, meaning: '請輸入文字' };
  }
  const remainder = count % 5;
  const match = FATE_CYCLE.find(f => f.index === remainder);
  return {
    count,
    name: match.name,
    isAuspicious: match.isAuspicious,
    remainder,
    meaning: match.meaning
  };
}

/**
 * 為指定字數提供調整至「老」或「生」的建議
 */
export function getAdjustmentAdvice(currentCount, targetRole = '中行') {
  const fate = evaluateFate(currentCount);
  if (fate.isAuspicious) {
    return {
      status: 'pass',
      message: `${targetRole}字數為 ${currentCount} 字，合於「${fate.name}」數（吉）。`
    };
  }

  // 若不合，計算最接近之「生」或「老」字數
  const options = [];
  for (let delta = -3; delta <= 3; delta++) {
    if (delta === 0) continue;
    const target = currentCount + delta;
    if (target > 0) {
      const f = evaluateFate(target);
      if (f.isAuspicious) {
        options.push({
          targetCount: target,
          delta,
          action: delta > 0 ? `增加 ${delta} 字` : `減少 ${Math.abs(delta)} 字`,
          targetFate: f.name
        });
      }
    }
  }

  return {
    status: 'warning',
    message: `${targetRole}字數為 ${currentCount} 字，落於「${fate.name}」數（凶），建議調整以合「生」或「老」。`,
    options
  };
}

/**
 * 根據成員資料自動產生標準牌位文字
 */
export function generateTabletTemplate(person, options = {}) {
  const isMale = (person.gender || '').toUpperCase() === 'M' || person.gender === '男';
  const lastName = person.last_name || '';
  const firstName = person.first_name || '';
  const hallName = person.hall_name || options.hallName || '堂上';
  const spouseLastName = options.spouseLastName || '';

  let middleText = '';
  let rightText = '';
  let leftText = '';

  // 生卒資訊組裝
  const birthPart = person.lunar_birth_date 
    ? `生於${person.lunar_birth_date}${person.birth_time_branch ? person.birth_time_branch + '時' : ''}`
    : (person.solar_birth_date ? `民國${person.solar_birth_date}生` : '');
  
  const deathPart = person.lunar_death_date
    ? `卒於${person.lunar_death_date}${person.death_time_branch ? person.death_time_branch + '時' : ''}`
    : (person.solar_death_date ? `民國${person.solar_death_date}卒` : '');

  rightText = [birthPart, deathPart].filter(Boolean).join(' ');

  if (isMale) {
    // 男考格式：通常以 12 字 (合老) 或 17 字 (合老)
    // 例：顯考 汪 公 諱 崇仁 府君 之神主 (12字)
    // 顯考 汪 公 諱 崇仁 府君 之神位 (12字)
    const base = `顯考${lastName}公諱${firstName}`;
    if (cleanTextCount(base + '府君之神位') % 5 === 2) {
      middleText = `${base}府君之神位`;
    } else if (cleanTextCount(base + '府君之神主') % 5 === 2) {
      middleText = `${base}府君之神主`;
    } else if (cleanTextCount(base + '之神位') % 5 === 2 || cleanTextCount(base + '之神位') % 5 === 1) {
      middleText = `${base}之神位`;
    } else {
      middleText = `${base}府君之神位`;
    }
  } else {
    // 女妣格式：
    // 例：顯妣 汪 門 陳 氏 諡 淑慈 孺人 之神位
    const postName = person.posthumous_name || firstName;
    const husbandSurname = options.husbandLastName || lastName;
    const maidenSurname = spouseLastName || person.maiden_name || lastName;

    let base = '';
    if (husbandSurname && husbandSurname !== maidenSurname) {
      base = `顯妣${husbandSurname}門${maidenSurname}氏`;
    } else {
      base = `顯妣${maidenSurname}氏`;
    }

    if (person.posthumous_name) {
      base += `諡${person.posthumous_name}孺人之神位`;
    } else {
      base += `諱${firstName}孺人之神位`;
    }
    middleText = base;
  }

  // 左行（奉祀子孫，通常合生或老，如：陽上孝男 祀、陽上裔孫奉祀）
  leftText = options.worshipperText || '陽上子孫奉祀';

  // 驗證三行字數
  const middleCount = cleanTextCount(middleText);
  const rightCount = cleanTextCount(rightText);
  const leftCount = cleanTextCount(leftText);

  return {
    hallName,
    middleText,
    rightText,
    leftText,
    middleCount,
    rightCount,
    leftCount,
    middleFate: evaluateFate(middleCount),
    rightFate: evaluateFate(rightCount),
    leftFate: evaluateFate(leftCount),
    middleAdvice: getAdjustmentAdvice(middleCount, '中行'),
    rightAdvice: getAdjustmentAdvice(rightCount, '右行'),
    leftAdvice: getAdjustmentAdvice(leftCount, '左行')
  };
}
