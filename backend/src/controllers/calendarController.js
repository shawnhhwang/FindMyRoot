import { convertSolarToLunar, convertLunarToSolar, EARTHLY_BRANCH_HOURS } from '../utils/calendar.js';

export function solarToLunar(req, res) {
  try {
    const { year, month, day, hour = 12, minute = 0 } = req.body;
    if (!year || !month || !day) {
      return res.status(400).json({ success: false, message: '請提供完整的西元年月日' });
    }

    const result = convertSolarToLunar(year, month, day, hour, minute);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('solarToLunar error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export function lunarToSolar(req, res) {
  try {
    const { year, month, day, isLeap = false } = req.body;
    if (!year || !month || !day) {
      return res.status(400).json({ success: false, message: '請提供完整的農曆年月日' });
    }

    const result = convertLunarToSolar(year, month, day, Boolean(isLeap));
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('lunarToSolar error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export function getBranchHours(req, res) {
  res.json({ success: true, data: EARTHLY_BRANCH_HOURS });
}
