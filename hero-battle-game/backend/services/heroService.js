const { getDB } = require('../database');

/**
 * 获取所有英雄
 */
async function getAllHeroes() {
    return new Promise((resolve, reject) => {
        const db = getDB();
        db.all(`
            SELECT 
                h.*,
                GROUP_CONCAT(DISTINCT hs.skill_id) as skill_ids
            FROM heroes h
            LEFT JOIN hero_skills hs ON h.id = hs.hero_id
            GROUP BY h.id
            ORDER BY h.star DESC, h.name ASC
        `, [], (err, rows) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                const heroes = rows.map(row => ({
                    id: row.id,
                    name: row.name,
                    dynasty: row.dynasty,
                    templeName: row.temple_name,
                    posthumousName: row.posthumous_name,
                    eraName: row.era_name,
                    bio: row.bio,
                    birthYear: row.birth_year,
                    deathYear: row.death_year,
                    element: row.element,
                    star: row.star,
                    baseHp: row.base_hp,
                    baseAtk: row.base_atk,
                    baseDef: row.base_def,
                    baseSpd: row.base_spd,
                    skillIds: row.skill_ids ? row.skill_ids.split(',').map(Number) : []
                }));
                resolve(heroes);
            }
        });
    });
}

/**
 * 根据ID获取英雄详情
 */
async function getHeroById(heroId) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        db.get(`
            SELECT 
                h.*,
                GROUP_CONCAT(DISTINCT hs.skill_id) as skill_ids
            FROM heroes h
            LEFT JOIN hero_skills hs ON h.id = hs.hero_id
            WHERE h.id = ?
            GROUP BY h.id
        `, [heroId], (err, row) => {
            db.close();
            if (err) {
                reject(err);
            } else if (!row) {
                resolve(null);
            } else {
                resolve({
                    id: row.id,
                    name: row.name,
                    dynasty: row.dynasty,
                    templeName: row.temple_name,
                    posthumousName: row.posthumous_name,
                    eraName: row.era_name,
                    bio: row.bio,
                    birthYear: row.birth_year,
                    deathYear: row.death_year,
                    element: row.element,
                    star: row.star,
                    baseHp: row.base_hp,
                    baseAtk: row.base_atk,
                    baseDef: row.base_def,
                    baseSpd: row.base_spd,
                    skillIds: row.skill_ids ? row.skill_ids.split(',').map(Number) : []
                });
            }
        });
    });
}

/**
 * 搜索英雄
 */
async function searchHeroes(query) {
    return new Promise((resolve, reject) => {
        const db = getDB();
        const searchTerm = `%${query}%`;
        db.all(`
            SELECT 
                h.*,
                GROUP_CONCAT(DISTINCT hs.skill_id) as skill_ids
            FROM heroes h
            LEFT JOIN hero_skills hs ON h.id = hs.hero_id
            WHERE h.name LIKE ? 
               OR h.temple_name LIKE ? 
               OR h.posthumous_name LIKE ? 
               OR h.era_name LIKE ?
            GROUP BY h.id
            ORDER BY h.star DESC, h.name ASC
        `, [searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                const heroes = rows.map(row => ({
                    id: row.id,
                    name: row.name,
                    dynasty: row.dynasty,
                    templeName: row.temple_name,
                    posthumousName: row.posthumous_name,
                    eraName: row.era_name,
                    bio: row.bio,
                    birthYear: row.birth_year,
                    deathYear: row.death_year,
                    element: row.element,
                    star: row.star,
                    baseHp: row.base_hp,
                    baseAtk: row.base_atk,
                    baseDef: row.base_def,
                    baseSpd: row.base_spd,
                    skillIds: row.skill_ids ? row.skill_ids.split(',').map(Number) : []
                }));
                resolve(heroes);
            }
        });
    });
}

/**
 * 计算英雄在指定等级下的属性值
 */
function calculateHeroStats(hero, level) {
    // 基础属性增长公式：每级增长基础值的5%
    const levelMultiplier = 1 + (level - 1) * 0.05;
    
    return {
        hp: Math.floor(hero.baseHp * levelMultiplier),
        atk: Math.floor(hero.baseAtk * levelMultiplier),
        def: Math.floor(hero.baseDef * levelMultiplier),
        spd: Math.floor(hero.baseSpd * levelMultiplier)
    };
}

module.exports = {
    getAllHeroes,
    getHeroById,
    searchHeroes,
    calculateHeroStats
};
