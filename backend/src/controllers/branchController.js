import db from '../db/connection.js';
import { initializeDatabase } from '../db/init.js';

/**
 * 取得宗族分支資訊
 */
export function getBranchInfo(req, res) {
  try {
    const branch = db.prepare('SELECT * FROM family_branches LIMIT 1').get();
    res.json({ success: true, data: branch || {} });
  } catch (error) {
    console.error('getBranchInfo error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 更新宗族分支設定
 */
export function updateBranchInfo(req, res) {
  try {
    const data = req.body;
    const branch = db.prepare('SELECT id FROM family_branches LIMIT 1').get();

    if (branch) {
      db.prepare(`
        UPDATE family_branches SET
          family_name = @family_name,
          hall_name = @hall_name,
          progenitor = @progenitor,
          generation_poem = @generation_poem,
          description = @description
        WHERE id = @id
      `).run({
        id: branch.id,
        family_name: data.family_name || '宗族',
        hall_name: data.hall_name || '堂上',
        progenitor: data.progenitor || '',
        generation_poem: data.generation_poem || '',
        description: data.description || ''
      });
    }

    res.json({ success: true, message: '宗族設定更新成功' });
  } catch (error) {
    console.error('updateBranchInfo error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 匯出全庫 JSON 備份
 */
export function exportDatabaseBackup(req, res) {
  try {
    const branches = db.prepare('SELECT * FROM family_branches').all();
    const people = db.prepare('SELECT * FROM people').all();
    const relationships = db.prepare('SELECT * FROM relationships').all();
    const tabletRecords = db.prepare('SELECT * FROM tablet_records').all();

    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      family_branches: branches,
      people,
      relationships,
      tablet_records: tabletRecords
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="findroot-backup.json"');
    res.json(backupData);
  } catch (error) {
    console.error('exportDatabaseBackup error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 從 JSON 還原資料庫
 */
export function importDatabaseBackup(req, res) {
  try {
    const data = req.body;
    if (!data || !data.people) {
      return res.status(400).json({ success: false, message: '備份格式不正確' });
    }

    // 使用交易包覆確保一致性
    const restoreTx = db.transaction(() => {
      db.prepare('DELETE FROM tablet_records').run();
      db.prepare('DELETE FROM relationships').run();
      db.prepare('DELETE FROM people').run();
      db.prepare('DELETE FROM family_branches').run();

      if (data.family_branches && data.family_branches.length) {
        const stmt = db.prepare(`
          INSERT INTO family_branches (id, family_name, hall_name, progenitor, generation_poem, description, created_at)
          VALUES (@id, @family_name, @hall_name, @progenitor, @generation_poem, @description, @created_at)
        `);
        for (const b of data.family_branches) stmt.run(b);
      }

      if (data.people && data.people.length) {
        const stmt = db.prepare(`
          INSERT INTO people (
            id, branch_id, first_name, last_name, courtesy_name, posthumous_name,
            generation_name, generation_num, gender, order_in_family,
            solar_birth_date, lunar_birth_date, is_birth_leap, birth_time_branch,
            solar_death_date, lunar_death_date, is_death_leap, death_time_branch,
            burial_location, biography, avatar_url, notes, created_at, updated_at
          ) VALUES (
            @id, @branch_id, @first_name, @last_name, @courtesy_name, @posthumous_name,
            @generation_name, @generation_num, @gender, @order_in_family,
            @solar_birth_date, @lunar_birth_date, @is_birth_leap, @birth_time_branch,
            @solar_death_date, @lunar_death_date, @is_death_leap, @death_time_branch,
            @burial_location, @biography, @avatar_url, @notes, @created_at, @updated_at
          )
        `);
        for (const p of data.people) stmt.run(p);
      }

      if (data.relationships && data.relationships.length) {
        const stmt = db.prepare(`
          INSERT INTO relationships (id, person_id, related_person_id, relation_type, notes, created_at)
          VALUES (@id, @person_id, @related_person_id, @relation_type, @notes, @created_at)
        `);
        for (const r of data.relationships) stmt.run(r);
      }

      if (data.tablet_records && data.tablet_records.length) {
        const stmt = db.prepare(`
          INSERT INTO tablet_records (
            id, person_id, hall_name, middle_text, right_text, left_text,
            middle_count, right_count, left_count, middle_fate, custom_style, created_at, updated_at
          ) VALUES (
            @id, @person_id, @hall_name, @middle_text, @right_text, @left_text,
            @middle_count, @right_count, @left_count, @middle_fate, @custom_style, @created_at, @updated_at
          )
        `);
        for (const t of data.tablet_records) stmt.run(t);
      }
    });

    restoreTx();
    res.json({ success: true, message: '族譜備份已順利還原！' });
  } catch (error) {
    console.error('importDatabaseBackup error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 重設示範資料
 */
export function resetDemoData(req, res) {
  try {
    db.prepare('DELETE FROM tablet_records').run();
    db.prepare('DELETE FROM relationships').run();
    db.prepare('DELETE FROM people').run();
    db.prepare('DELETE FROM family_branches').run();

    initializeDatabase();
    res.json({ success: true, message: '示範族譜與牌位資料已重置完成' });
  } catch (error) {
    console.error('resetDemoData error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
