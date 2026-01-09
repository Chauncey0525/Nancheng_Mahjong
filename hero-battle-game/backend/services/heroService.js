const { getDB } = require('../database');

/**
 * 获取所有英雄
 */
async function getAllHeroes() {
    return new Promise((resolve, reject) => {
        const db = getDB();
        db.all(`
            SELECT *
            FROM heroes h
            ORDER BY h.name ASC
        `, [], (err, rows) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                const heroes = rows.map(row => ({
                    id: row.id,
                    name: row.name,
                    dynasty: row.dynasty,
                    title: row.title,
                    bio: row.bio,
                    element: row.element || '普通',
                    role: row.role || '战士',
                    baseHp: row.base_hp || 100,
                    basePhysAtk: row.base_phys_atk || row.base_atk || 50,
                    baseMagicAtk: row.base_magic_atk || 50,
                    basePhysDef: row.base_phys_def || row.base_def || 50,
                    baseMagicDef: row.base_magic_def || 50,
                    baseSpeed: row.base_speed || row.base_spd || 50,
                    skillIds: []
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
            SELECT *
            FROM heroes h
            WHERE h.id = ?
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
                    title: row.title,
                    bio: row.bio,
                    gender: row.gender || '男',
                    element: row.element || '普通',
                    role: row.role || '战士',
                    baseHp: row.base_hp || 100,
                    basePhysAtk: row.base_phys_atk || row.base_atk || 50,
                    baseMagicAtk: row.base_magic_atk || 50,
                    basePhysDef: row.base_phys_def || row.base_def || 50,
                    baseMagicDef: row.base_magic_def || 50,
                    baseSpeed: row.base_speed || row.base_spd || 50,
                    skillIds: []
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
            SELECT *
            FROM heroes h
            WHERE h.name LIKE ? 
               OR h.title LIKE ?
               OR h.dynasty LIKE ?
            ORDER BY h.name ASC
        `, [searchTerm, searchTerm, searchTerm], (err, rows) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                const heroes = rows.map(row => ({
                    id: row.id,
                    name: row.name,
                    dynasty: row.dynasty,
                    title: row.title,
                    bio: row.bio,
                    element: row.element || '普通',
                    role: row.role || '战士',
                    baseHp: row.base_hp || 100,
                    basePhysAtk: row.base_phys_atk || row.base_atk || 50,
                    baseMagicAtk: row.base_magic_atk || 50,
                    basePhysDef: row.base_phys_def || row.base_def || 50,
                    baseMagicDef: row.base_magic_def || 50,
                    baseSpeed: row.base_speed || row.base_spd || 50,
                    skillIds: []
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
        physAtk: Math.floor(hero.basePhysAtk * levelMultiplier),
        magicAtk: Math.floor(hero.baseMagicAtk * levelMultiplier),
        physDef: Math.floor(hero.basePhysDef * levelMultiplier),
        magicDef: Math.floor(hero.baseMagicDef * levelMultiplier),
        speed: Math.floor(hero.baseSpeed * levelMultiplier)
    };
}

module.exports = {
    getAllHeroes,
    getHeroById,
    searchHeroes,
    calculateHeroStats
};
