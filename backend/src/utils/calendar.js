import { Solar, Lunar, LunarYear } from 'lunar-javascript';

// 十二時辰對應
export const EARTHLY_BRANCH_HOURS = [
  { name: '子時', branch: '子', range: '23:00 - 01:00', startHour: 23 },
  { name: '丑時', branch: '丑', range: '01:00 - 03:00', startHour: 1 },
  { name: '寅時', branch: '寅', range: '03:00 - 05:00', startHour: 3 },
  { name: '卯時', branch: '卯', range: '05:00 - 07:00', startHour: 5 },
  { name: '辰時', branch: '辰', range: '07:00 - 09:00', startHour: 7 },
  { name: '巳時', branch: '巳', range: '09:00 - 11:00', startHour: 9 },
  { name: '午時', branch: '午', range: '11:00 - 13:00', startHour: 11 },
  { name: '未時', branch: '未', range: '13:00 - 15:00', startHour: 13 },
  { name: '申時', branch: '申', range: '15:00 - 17:00', startHour: 15 },
  { name: '酉時', branch: '酉', range: '17:00 - 19:00', startHour: 17 },
  { name: '戌時', branch: '戌', range: '19:00 - 21:00', startHour: 19 },
  { name: '亥時', branch: '亥', range: '21:00 - 23:00', startHour: 21 },
];

/**
 * 依據小時 (0-23) 取得對應時辰
 */
export function getBranchByHour(hour = 12) {
  const h = Number(hour);
  if (h >= 23 || h < 1) return EARTHLY_BRANCH_HOURS[0];
  const idx = Math.floor((h + 1) / 2);
  return EARTHLY_BRANCH_HOURS[idx] || EARTHLY_BRANCH_HOURS[0];
}

/**
 * 西元國曆轉農曆
 */
export function convertSolarToLunar(year, month, day, hour = 12, minute = 0) {
  const solar = Solar.fromYmdHms(Number(year), Number(month), Number(day), Number(hour), Number(minute), 0);
  const lunar = solar.getLunar();

  const branchInfo = getBranchByHour(hour);

  return {
    solar: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      dateString: `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`,
    },
    lunar: {
      year: lunar.getYear(),
      month: Math.abs(lunar.getMonth()),
      day: lunar.getDay(),
      isLeap: lunar.getMonth() < 0,
      yearInGanZhi: lunar.getYearInGanZhi(),       // 例如: 癸卯
      yearShengXiao: lunar.getYearShengXiao(),     // 例如: 兔
      monthInGanZhi: lunar.getMonthInGanZhi(),
      dayInGanZhi: lunar.getDayInGanZhi(),
      timeInGanZhi: lunar.getTimeInGanZhi(),
      monthChinese: lunar.getMonthInChinese() + '月',
      dayChinese: lunar.getDayInChinese(),
      fullChineseText: `${lunar.getYearInGanZhi()}年${lunar.getMonth() < 0 ? '閏' : ''}${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      timeBranch: branchInfo.name
    },
    minguoYear: solar.getYear() - 1911,
    eightCharacters: lunar.getBaZi().join(' ')
  };
}

/**
 * 農曆轉西元國曆
 */
export function convertLunarToSolar(year, month, day, isLeap = false) {
  const m = isLeap ? -Math.abs(Number(month)) : Math.abs(Number(month));
  const lunar = Lunar.fromYmd(Number(year), m, Number(day));
  const solar = lunar.getSolar();

  return {
    solar: {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      dateString: `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`,
    },
    lunar: {
      year: lunar.getYear(),
      month: Math.abs(lunar.getMonth()),
      day: lunar.getDay(),
      isLeap: lunar.getMonth() < 0,
      yearInGanZhi: lunar.getYearInGanZhi(),
      yearShengXiao: lunar.getYearShengXiao(),
      monthChinese: lunar.getMonthInChinese() + '月',
      dayChinese: lunar.getDayInChinese(),
      fullChineseText: `${lunar.getYearInGanZhi()}年${lunar.getMonth() < 0 ? '閏' : ''}${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
    },
    minguoYear: solar.getYear() - 1911
  };
}
