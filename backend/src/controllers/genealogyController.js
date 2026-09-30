import db from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * 取得世系圖起點（始祖/開基祖或一代先祖）
 */
export function getTreeRoots(req, res) {
  try {
    // 找出 generation_num 為 1，或者沒有父親關係的成員
    const roots = db.prepare(`
      SELECT p.* FROM people p
      WHERE p.generation_num = 1 
         OR p.id NOT IN (
           SELECT person_id FROM relationships WHERE relation_type IN ('FATHER')
         )
      ORDER BY p.generation_num ASC, p.solar_birth_date ASC
    `).all();

    res.json({ success: true, data: roots });
  } catch (error) {
    console.error('getTreeRoots error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 遞迴組裝家族世系樹
 */
export function getFamilyTree(req, res) {
  try {
    const { rootId } = req.query;

    // 若未指定 rootId，預設尋找代數最小的一世祖
    let root = null;
    if (rootId) {
      root = db.prepare('SELECT * FROM people WHERE id = ?').get(rootId);
    }

    if (!root) {
      root = db.prepare('SELECT * FROM people ORDER BY generation_num ASC, solar_birth_date ASC LIMIT 1').get();
    }

    if (!root) {
      return res.json({ success: true, data: null });
    }

    // 建立快取地圖以利高效能遞迴建構
    const allPeople = db.prepare('SELECT * FROM people').all();
    const peopleMap = new Map();
    allPeople.forEach(p => peopleMap.set(p.id, p));

    const allRelationships = db.prepare('SELECT * FROM relationships').all();

    // 建立父母->子女對照表
    const parentToChildren = new Map();
    // 建立配偶對照表
    const personToSpouses = new Map();

    allRelationships.forEach(rel => {
      if (rel.relation_type === 'FATHER' || rel.relation_type === 'MOTHER') {
        const parentId = rel.related_person_id;
        const childId = rel.person_id;
        if (!parentToChildren.has(parentId)) {
          parentToChildren.set(parentId, new Set());
        }
        parentToChildren.get(parentId).add(childId);
      } else if (rel.relation_type === 'SPOUSE') {
        if (!personToSpouses.has(rel.person_id)) {
          personToSpouses.set(rel.person_id, []);
        }
        const spouseObj = peopleMap.get(rel.related_person_id);
        if (spouseObj) {
          personToSpouses.get(rel.person_id).push(spouseObj);
        }
      }
    });

    // 遞迴組裝節點（防範循環參考）
    function buildNode(personId, visited = new Set()) {
      if (visited.has(personId)) return null;
      visited.add(personId);

      const p = peopleMap.get(personId);
      if (!p) return null;

      // 取得配偶
      const spouses = personToSpouses.get(personId) || [];

      // 取得此人與其配偶名下的子女集合
      const childIdSet = new Set();
      const directChildren = parentToChildren.get(personId) || new Set();
      directChildren.forEach(cId => childIdSet.add(cId));

      // 若為父親，也把母為其配偶的子女納入（避免單親登錄疏漏）
      spouses.forEach(sp => {
        const spChildren = parentToChildren.get(sp.id) || new Set();
        spChildren.forEach(cId => childIdSet.add(cId));
      });

      // 轉為陣列並按出生日期/排行排序
      const childNodes = Array.from(childIdSet)
        .map(cId => peopleMap.get(cId))
        .filter(Boolean)
        .sort((a, b) => (a.solar_birth_date || '').localeCompare(b.solar_birth_date || ''))
        .map(c => buildNode(c.id, new Set(visited)))
        .filter(Boolean);

      return {
        id: p.id,
        name: `${p.last_name}${p.first_name}`,
        first_name: p.first_name,
        last_name: p.last_name,
        courtesy_name: p.courtesy_name,
        generation_num: p.generation_num,
        generation_name: p.generation_name,
        gender: p.gender,
        order_in_family: p.order_in_family,
        solar_birth_date: p.solar_birth_date,
        lunar_birth_date: p.lunar_birth_date,
        birth_time_branch: p.birth_time_branch,
        solar_death_date: p.solar_death_date,
        lunar_death_date: p.lunar_death_date,
        death_time_branch: p.death_time_branch,
        burial_location: p.burial_location,
        biography: p.biography,
        isDeceased: Boolean(p.solar_death_date || p.lunar_death_date),
        spouses: spouses.map(s => ({
          id: s.id,
          name: `${s.last_name}${s.first_name}`,
          gender: s.gender,
          solar_birth_date: s.solar_birth_date,
          lunar_birth_date: s.lunar_birth_date,
          solar_death_date: s.solar_death_date,
          lunar_death_date: s.lunar_death_date,
          isDeceased: Boolean(s.solar_death_date || s.lunar_death_date)
        })),
        children: childNodes
      };
    }

    const tree = buildNode(root.id);
    res.json({ success: true, data: tree, root });
  } catch (error) {
    console.error('getFamilyTree error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 建立親屬關聯
 */
export function addRelationship(req, res) {
  try {
    const { person_id, related_person_id, relation_type, notes } = req.body;
    if (!person_id || !related_person_id || !relation_type) {
      return res.status(400).json({ success: false, message: '缺少必要關係參數' });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO relationships (id, person_id, related_person_id, relation_type, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, person_id, related_person_id, relation_type, notes || '');

    // 若為配偶，自動建立雙向
    if (relation_type === 'SPOUSE') {
      db.prepare(`
        INSERT INTO relationships (id, person_id, related_person_id, relation_type, notes)
        VALUES (?, ?, ?, 'SPOUSE', ?)
      `).run(uuidv4(), related_person_id, person_id, notes || '');
    }

    res.json({ success: true, id, message: '親屬關係建立成功' });
  } catch (error) {
    console.error('addRelationship error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * 刪除親屬關聯
 */
export function deleteRelationship(req, res) {
  try {
    const { id } = req.params;
    const rel = db.prepare('SELECT * FROM relationships WHERE id = ?').get(id);
    if (!rel) {
      return res.status(404).json({ success: false, message: '查無此關係' });
    }

    // 若為配偶，刪除雙向關係
    if (rel.relation_type === 'SPOUSE') {
      db.prepare(`
        DELETE FROM relationships 
        WHERE (person_id = ? AND related_person_id = ?) 
           OR (person_id = ? AND related_person_id = ?)
      `).run(rel.person_id, rel.related_person_id, rel.related_person_id, rel.person_id);
    } else {
      db.prepare('DELETE FROM relationships WHERE id = ?').run(id);
    }

    res.json({ success: true, message: '親屬關係已解除' });
  } catch (error) {
    console.error('deleteRelationship error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
