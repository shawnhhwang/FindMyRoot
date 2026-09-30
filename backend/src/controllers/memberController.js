import db from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * 查詢成員清單（支援姓名、世代、性別篩選）
 */
export function getMembers(req, res) {
  try {
    const { keyword, generation, gender, branchId } = req.query;
    let query = `
      SELECT p.*, b.family_name, b.hall_name 
      FROM people p
      LEFT JOIN family_branches b ON p.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (keyword) {
      query += ` AND (p.first_name LIKE ? OR p.last_name LIKE ? OR p.courtesy_name LIKE ? OR (p.last_name || p.first_name) LIKE ?)`;
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw, kw);
    }

    if (generation) {
      query += ` AND p.generation_num = ?`;
      params.push(Number(generation));
    }

    if (gender) {
      query += ` AND p.gender = ?`;
      params.push(gender);
    }

    if (branchId) {
      query += ` AND p.branch_id = ?`;
      params.push(branchId);
    }

    query += ` ORDER BY p.generation_num ASC, p.solar_birth_date ASC, p.created_at ASC`;

    const members = db.prepare(query).all(...params);
    res.json({ success: true, data: members });
  } catch (error) {
    console.error('getMembers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 取得單一成員詳情（包含父母、配偶、子女關係）
 */
export function getMemberById(req, res) {
  try {
    const { id } = req.params;
    const person = db.prepare(`
      SELECT p.*, b.family_name, b.hall_name 
      FROM people p
      LEFT JOIN family_branches b ON p.branch_id = b.id
      WHERE p.id = ?
    `).get(id);

    if (!person) {
      return res.status(404).json({ success: false, message: '查無此成員' });
    }

    // 查詢父親與母親
    const parents = db.prepare(`
      SELECT r.relation_type, p.id, p.first_name, p.last_name, p.gender, p.generation_num
      FROM relationships r
      JOIN people p ON r.related_person_id = p.id
      WHERE r.person_id = ? AND r.relation_type IN ('FATHER', 'MOTHER')
    `).all(id);

    const father = parents.find(p => p.relation_type === 'FATHER') || null;
    const mother = parents.find(p => p.relation_type === 'MOTHER') || null;

    // 查詢配偶
    const spouses = db.prepare(`
      SELECT r.id as relationship_id, r.notes, p.id, p.first_name, p.last_name, p.gender
      FROM relationships r
      JOIN people p ON r.related_person_id = p.id
      WHERE r.person_id = ? AND r.relation_type = 'SPOUSE'
    `).all(id);

    // 查詢子女
    const children = db.prepare(`
      SELECT r.relation_type, p.id, p.first_name, p.last_name, p.gender, p.generation_num, p.solar_birth_date
      FROM relationships r
      JOIN people p ON r.person_id = p.id
      WHERE r.related_person_id = ? AND r.relation_type IN ('FATHER', 'MOTHER')
      ORDER BY p.solar_birth_date ASC
    `).all(id);

    res.json({
      success: true,
      data: {
        ...person,
        father,
        mother,
        spouses,
        children
      }
    });
  } catch (error) {
    console.error('getMemberById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 新增成員
 */
export function createMember(req, res) {
  try {
    const data = req.body;
    const id = data.id || `person-${uuidv4().slice(0, 8)}`;

    const insert = db.prepare(`
      INSERT INTO people (
        id, branch_id, first_name, last_name, courtesy_name, posthumous_name,
        generation_name, generation_num, gender, order_in_family,
        solar_birth_date, lunar_birth_date, is_birth_leap, birth_time_branch,
        solar_death_date, lunar_death_date, is_death_leap, death_time_branch,
        burial_location, biography, avatar_url, notes
      ) VALUES (
        @id, @branch_id, @first_name, @last_name, @courtesy_name, @posthumous_name,
        @generation_name, @generation_num, @gender, @order_in_family,
        @solar_birth_date, @lunar_birth_date, @is_birth_leap, @birth_time_branch,
        @solar_death_date, @lunar_death_date, @is_death_leap, @death_time_branch,
        @burial_location, @biography, @avatar_url, @notes
      )
    `);

    insert.run({
      id,
      branch_id: data.branch_id || 'branch-chen-01',
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      courtesy_name: data.courtesy_name || '',
      posthumous_name: data.posthumous_name || '',
      generation_name: data.generation_name || '',
      generation_num: Number(data.generation_num) || 1,
      gender: data.gender || 'M',
      order_in_family: data.order_in_family || '',
      solar_birth_date: data.solar_birth_date || '',
      lunar_birth_date: data.lunar_birth_date || '',
      is_birth_leap: data.is_birth_leap ? 1 : 0,
      birth_time_branch: data.birth_time_branch || '',
      solar_death_date: data.solar_death_date || '',
      lunar_death_date: data.lunar_death_date || '',
      is_death_leap: data.is_death_leap ? 1 : 0,
      death_time_branch: data.death_time_branch || '',
      burial_location: data.burial_location || '',
      biography: data.biography || '',
      avatar_url: data.avatar_url || '',
      notes: data.notes || ''
    });

    // 建立父母關係
    if (data.father_id) {
      db.prepare(`
        INSERT INTO relationships (id, person_id, related_person_id, relation_type, notes)
        VALUES (?, ?, ?, 'FATHER', '父親')
      `).run(uuidv4(), id, data.father_id);
    }
    if (data.mother_id) {
      db.prepare(`
        INSERT INTO relationships (id, person_id, related_person_id, relation_type, notes)
        VALUES (?, ?, ?, 'MOTHER', '母親')
      `).run(uuidv4(), id, data.mother_id);
    }
    // 建立配偶關係 (雙向)
    if (data.spouse_id) {
      db.prepare(`
        INSERT INTO relationships (id, person_id, related_person_id, relation_type, notes)
        VALUES (?, ?, ?, 'SPOUSE', '配偶')
      `).run(uuidv4(), id, data.spouse_id);
      db.prepare(`
        INSERT INTO relationships (id, person_id, related_person_id, relation_type, notes)
        VALUES (?, ?, ?, 'SPOUSE', '配偶')
      `).run(uuidv4(), data.spouse_id, id);
    }

    res.json({ success: true, id, message: '成員新增成功' });
  } catch (error) {
    console.error('createMember error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 更新成員資料
 */
export function updateMember(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const update = db.prepare(`
      UPDATE people SET
        first_name = @first_name,
        last_name = @last_name,
        courtesy_name = @courtesy_name,
        posthumous_name = @posthumous_name,
        generation_name = @generation_name,
        generation_num = @generation_num,
        gender = @gender,
        order_in_family = @order_in_family,
        solar_birth_date = @solar_birth_date,
        lunar_birth_date = @lunar_birth_date,
        is_birth_leap = @is_birth_leap,
        birth_time_branch = @birth_time_branch,
        solar_death_date = @solar_death_date,
        lunar_death_date = @lunar_death_date,
        is_death_leap = @is_death_leap,
        death_time_branch = @death_time_branch,
        burial_location = @burial_location,
        biography = @biography,
        avatar_url = @avatar_url,
        notes = @notes,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);

    update.run({
      id,
      first_name: data.first_name,
      last_name: data.last_name,
      courtesy_name: data.courtesy_name || '',
      posthumous_name: data.posthumous_name || '',
      generation_name: data.generation_name || '',
      generation_num: Number(data.generation_num) || 1,
      gender: data.gender || 'M',
      order_in_family: data.order_in_family || '',
      solar_birth_date: data.solar_birth_date || '',
      lunar_birth_date: data.lunar_birth_date || '',
      is_birth_leap: data.is_birth_leap ? 1 : 0,
      birth_time_branch: data.birth_time_branch || '',
      solar_death_date: data.solar_death_date || '',
      lunar_death_date: data.lunar_death_date || '',
      is_death_leap: data.is_death_leap ? 1 : 0,
      death_time_branch: data.death_time_branch || '',
      burial_location: data.burial_location || '',
      biography: data.biography || '',
      avatar_url: data.avatar_url || '',
      notes: data.notes || ''
    });

    // 處理父母關係更新 (若有提供)
    if (data.father_id !== undefined) {
      db.prepare(`DELETE FROM relationships WHERE person_id = ? AND relation_type = 'FATHER'`).run(id);
      if (data.father_id) {
        db.prepare(`INSERT INTO relationships (id, person_id, related_person_id, relation_type, notes) VALUES (?, ?, ?, 'FATHER', '父親')`)
          .run(uuidv4(), id, data.father_id);
      }
    }

    if (data.mother_id !== undefined) {
      db.prepare(`DELETE FROM relationships WHERE person_id = ? AND relation_type = 'MOTHER'`).run(id);
      if (data.mother_id) {
        db.prepare(`INSERT INTO relationships (id, person_id, related_person_id, relation_type, notes) VALUES (?, ?, ?, 'MOTHER', '母親')`)
          .run(uuidv4(), id, data.mother_id);
      }
    }

    res.json({ success: true, message: '成員更新成功' });
  } catch (error) {
    console.error('updateMember error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 刪除成員
 */
export function deleteMember(req, res) {
  try {
    const { id } = req.params;
    // 檢查是否有子女以其為雙親
    const childRelations = db.prepare(`
      SELECT COUNT(*) as count FROM relationships 
      WHERE related_person_id = ? AND relation_type IN ('FATHER', 'MOTHER')
    `).get(id);

    if (childRelations.count > 0) {
      return res.status(400).json({
        success: false,
        message: `此成員尚有 ${childRelations.count} 位子女關聯，無法直接刪除。請先調整子女之雙親關聯。`
      });
    }

    db.prepare('DELETE FROM people WHERE id = ?').run(id);
    db.prepare('DELETE FROM relationships WHERE person_id = ? OR related_person_id = ?').run(id, id);
    db.prepare('DELETE FROM tablet_records WHERE person_id = ?').run(id);

    res.json({ success: true, message: '成員已刪除' });
  } catch (error) {
    console.error('deleteMember error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
