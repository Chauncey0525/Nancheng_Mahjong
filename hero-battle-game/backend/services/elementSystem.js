/**
 * 属性系统 - 参考宝可梦
 * 包含属性类型和克制关系
 */

// 属性类型（参考宝可梦，扩展了中文历史主题）
const ELEMENTS = {
    '普通': { name: '普通', color: '#A8A878' },
    '火': { name: '火', color: '#F08030' },
    '水': { name: '水', color: '#6890F0' },
    '草': { name: '草', color: '#78C850' },
    '木': { name: '木', color: '#78C850' }, // 与草系相同
    '电': { name: '电', color: '#F8D030' },
    '冰': { name: '冰', color: '#98D8D8' },
    '格斗': { name: '格斗', color: '#C03028' },
    '毒': { name: '毒', color: '#A040A0' },
    '地面': { name: '地面', color: '#E0C068' },
    '飞行': { name: '飞行', color: '#A890F0' },
    '超能力': { name: '超能力', color: '#F85888' },
    '虫': { name: '虫', color: '#A8B820' },
    '岩石': { name: '岩石', color: '#B8A038' },
    '幽灵': { name: '幽灵', color: '#705898' },
    '暗': { name: '暗', color: '#705848' },
    '龙': { name: '龙', color: '#7038F8' },
    '钢': { name: '钢', color: '#B8B8D0' },
    '金': { name: '金', color: '#FFD700' },
    '土': { name: '土', color: '#D4A574' }
};

// 属性克制关系（参考宝可梦，key克制value数组中的属性）
const ELEMENT_WEAKNESS = {
    '火': ['草', '木', '虫', '冰', '钢'],
    '水': ['火', '地面', '岩石'],
    '草': ['水', '地面', '岩石'],
    '木': ['水', '地面', '岩石'],
    '电': ['水', '飞行'],
    '冰': ['草', '木', '地面', '飞行', '龙'],
    '格斗': ['普通', '冰', '岩石', '暗', '钢'],
    '毒': ['草', '木'],
    '地面': ['火', '电', '毒', '岩石', '钢'],
    '飞行': ['格斗', '虫', '草', '木'],
    '超能力': ['格斗', '毒'],
    '虫': ['草', '木', '超能力', '暗'],
    '岩石': ['火', '冰', '飞行', '虫'],
    '幽灵': ['幽灵', '超能力'],
    '暗': ['幽灵', '超能力'],
    '龙': ['龙'],
    '钢': ['冰', '岩石'],
    '金': ['木', '草'],
    '土': ['水', '电']
};

// 属性被克制关系（value数组中的属性克制key）
const ELEMENT_RESISTANCE = {
    '火': ['水', '地面', '岩石'],
    '水': ['草', '木', '电'],
    '草': ['火', '冰', '毒', '飞行', '虫'],
    '木': ['火', '冰', '毒', '飞行', '虫', '金'],
    '电': ['地面'],
    '冰': ['火', '格斗', '岩石', '钢'],
    '格斗': ['飞行', '超能力', '暗'],
    '毒': ['地面', '超能力'],
    '地面': ['水', '草', '木', '冰'],
    '飞行': ['电', '冰', '岩石'],
    '超能力': ['暗', '虫', '幽灵'],
    '虫': ['火', '飞行', '岩石'],
    '岩石': ['水', '草', '木', '格斗', '地面', '钢'],
    '幽灵': ['暗', '幽灵'],
    '暗': ['格斗', '虫'],
    '龙': ['冰', '龙'],
    '钢': ['火', '格斗', '地面'],
    '金': ['火'],
    '土': ['木', '草', '水']
};

/**
 * 计算属性相克倍率
 * @param {string} attackerElement - 攻击方属性
 * @param {string} defenderElement - 防御方属性
 * @returns {number} 伤害倍率
 */
function calculateElementMultiplier(attackerElement, defenderElement) {
    if (!attackerElement || !defenderElement) {
        return 1.0;
    }
    
    // 检查是否克制
    if (ELEMENT_WEAKNESS[attackerElement] && ELEMENT_WEAKNESS[attackerElement].includes(defenderElement)) {
        return 2.0; // 克制时伤害翻倍（宝可梦标准）
    }
    
    // 检查是否被抵抗
    if (ELEMENT_RESISTANCE[defenderElement] && ELEMENT_RESISTANCE[defenderElement].includes(attackerElement)) {
        return 0.5; // 被抵抗时伤害减半（宝可梦标准）
    }
    
    return 1.0; // 无相克关系
}

/**
 * 获取属性信息
 * @param {string} element - 属性名称
 * @returns {object} 属性信息
 */
function getElementInfo(element) {
    return ELEMENTS[element] || ELEMENTS['普通'];
}

/**
 * 获取所有属性类型
 * @returns {array} 所有属性列表
 */
function getAllElements() {
    return Object.keys(ELEMENTS);
}

/**
 * 检查属性是否有效
 * @param {string} element - 属性名称
 * @returns {boolean} 是否有效
 */
function isValidElement(element) {
    return ELEMENTS.hasOwnProperty(element);
}

module.exports = {
    ELEMENTS,
    ELEMENT_WEAKNESS,
    ELEMENT_RESISTANCE,
    calculateElementMultiplier,
    getElementInfo,
    getAllElements,
    isValidElement
};
