import db from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import { 
  generateTabletTemplate, 
  evaluateFate, 
  cleanTextCount, 
  getAdjustmentAdvice 
} from '../utils/tablet.js';

/**
 * 依成員或輸入資訊自動產生牌位格式並校驗字數
 */
export function formatTablet(req, res) {
  try {
    const { personId, manualPerson, options = {} } = req.body;
    let person = null;

    if (personId) {
      person = db.prepare(`
        SELECT p.*, b.hall_name 
        FROM people p
        LEFT JOIN family_branches b ON p.branch_id = b.id
        WHERE p.id = ?
      `).get(personId);
    } else if (manualPerson) {
      person = manualPerson;
    }

    if (!person) {
      return res.status(400).json({ success: false, message: '請指定成員或輸入先人資訊' });
    }

    // 若有配偶姓氏需求，自動從關係庫抓取配偶資料
    let spouseLastName = '';
    let husbandLastName = '';
    if (personId) {
      const spouse = db.prepare(`
        SELECT p.last_name, p.gender FROM relationships r
        JOIN people p ON r.related_person_id = p.id
        WHERE r.person_id = ? AND r.relation_type = 'SPOUSE'
        LIMIT 1
      `).get(personId);

      if (spouse) {
        if (person.gender === 'F' || person.gender === '女') {
          husbandLastName = spouse.last_name;
        } else {
          spouseLastName = spouse.last_name;
        }
      }
    }

    const templateResult = generateTabletTemplate(person, {
      ...options,
      spouseLastName: options.spouseLastName || spouseLastName,
      husbandLastName: options.husbandLastName || husbandLastName
    });

    res.json({
      success: true,
      data: {
        person,
        ...templateResult
      }
    });
  } catch (error) {
    console.error('formatTablet error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 即時驗證自訂文字字數與吉凶神數
 */
export function validateTabletText(req, res) {
  try {
    const { middleText = '', rightText = '', leftText = '' } = req.body;

    const middleCount = cleanTextCount(middleText);
    const rightCount = cleanTextCount(rightText);
    const leftCount = cleanTextCount(leftText);

    res.json({
      success: true,
      data: {
        middle: {
          count: middleCount,
          fate: evaluateFate(middleCount),
          advice: getAdjustmentAdvice(middleCount, '中行')
        },
        right: {
          count: rightCount,
          fate: evaluateFate(rightCount),
          advice: getAdjustmentAdvice(rightCount, '右行')
        },
        left: {
          count: leftCount,
          fate: evaluateFate(leftCount),
          advice: getAdjustmentAdvice(leftCount, '左行')
        }
      }
    });
  } catch (error) {
    console.error('validateTabletText error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 取得所有已儲存之牌位紀錄
 */
export function getTabletRecords(req, res) {
  try {
    const records = db.prepare(`
      SELECT t.*, p.first_name, p.last_name, p.gender, p.generation_num
      FROM tablet_records t
      LEFT JOIN people p ON t.person_id = p.id
      ORDER BY t.created_at DESC
    `).all();

    res.json({ success: true, data: records });
  } catch (error) {
    console.error('getTabletRecords error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 儲存牌位排版設定
 */
export function saveTabletRecord(req, res) {
  try {
    const data = req.body;
    const id = data.id || `tablet-${uuidv4().slice(0, 8)}`;

    const middleCount = cleanTextCount(data.middle_text);
    const rightCount = cleanTextCount(data.right_text);
    const leftCount = cleanTextCount(data.left_text);
    const fate = evaluateFate(middleCount);

    const existing = db.prepare('SELECT id FROM tablet_records WHERE id = ?').get(id);

    if (existing) {
      db.prepare(`
        UPDATE tablet_records SET
          person_id = @person_id,
          hall_name = @hall_name,
          middle_text = @middle_text,
          right_text = @right_text,
          left_text = @left_text,
          middle_count = @middle_count,
          right_count = @right_count,
          left_count = @left_count,
          middle_fate = @middle_fate,
          custom_style = @custom_style,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
      `).run({
        id,
        person_id: data.person_id || null,
        hall_name: data.hall_name || '',
        middle_text: data.middle_text,
        right_text: data.right_text || '',
        left_text: data.left_text || '',
        middle_count: middleCount,
        right_count: rightCount,
        left_count: leftCount,
        middle_fate: fate.name,
        custom_style: typeof data.custom_style === 'object' ? JSON.stringify(data.custom_style) : (data.custom_style || '')
      });
    } else {
      db.prepare(`
        INSERT INTO tablet_records (
          id, person_id, hall_name, middle_text, right_text, left_text,
          middle_count, right_count, left_count, middle_fate, custom_style
        ) VALUES (
          @id, @person_id, @hall_name, @middle_text, @right_text, @left_text,
          @middle_count, @right_count, @left_count, @middle_fate, @custom_style
        )
      `).run({
        id,
        person_id: data.person_id || null,
        hall_name: data.hall_name || '',
        middle_text: data.middle_text,
        right_text: data.right_text || '',
        left_text: data.left_text || '',
        middle_count: middleCount,
        right_count: rightCount,
        left_count: leftCount,
        middle_fate: fate.name,
        custom_style: typeof data.custom_style === 'object' ? JSON.stringify(data.custom_style) : (data.custom_style || '')
      });
    }

    res.json({ success: true, id, message: '牌位設定已儲存' });
  } catch (error) {
    console.error('saveTabletRecord error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 刪除牌位紀錄
 */
export function deleteTabletRecord(req, res) {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM tablet_records WHERE id = ?').run(id);
    res.json({ success: true, message: '牌位紀錄已刪除' });
  } catch (error) {
    console.error('deleteTabletRecord error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
