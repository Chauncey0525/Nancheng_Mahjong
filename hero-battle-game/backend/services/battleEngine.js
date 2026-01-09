/**
 * 战斗引擎核心逻辑
 */

const { calculateElementMultiplier } = require('./elementSystem');

/**
 * 计算伤害（支持物理和魔法攻击）
 */
function calculateDamage(attacker, defender, skillMultiplier = 1.0, isPhysical = true) {
    const elementMultiplier = calculateElementMultiplier(attacker.element, defender.element);
    
    // 根据攻击类型选择攻击力和防御力
    const attackStat = isPhysical ? attacker.stats.physAtk : attacker.stats.magicAtk;
    const defenseStat = isPhysical ? defender.stats.physDef : defender.stats.magicDef;
    
    const baseDamage = attackStat * skillMultiplier;
    const defenseReduction = defenseStat * 0.5; // 防御减伤
    const finalDamage = Math.max(1, Math.floor((baseDamage - defenseReduction) * elementMultiplier));
    return finalDamage;
}

/**
 * 初始化战斗
 */
function initializeBattle(battle) {
    // 初始化战斗单位状态
    battle.playerUnits = battle.playerTeam.map((hero, index) => ({
        ...hero,
        currentHp: hero.stats.hp,
        maxHp: hero.stats.hp,
        position: index,
        statusEffects: [],
        isAlive: true
    }));
    
    battle.opponentUnits = battle.opponentTeam.map((hero, index) => ({
        ...hero,
        currentHp: hero.stats.hp,
        maxHp: hero.stats.hp,
        position: index,
        statusEffects: [],
        isAlive: true
    }));
    
    // 生成行动顺序（按速度排序）
    battle.turnOrder = generateTurnOrder([...battle.playerUnits, ...battle.opponentUnits], battle.playerUnits);
    battle.currentTurnIndex = 0;
    
    battle.battleLog.push({
        type: 'battle_start',
        message: '战斗开始！'
    });
}

/**
 * 生成行动顺序
 */
function generateTurnOrder(units, playerUnits) {
    return units
        .map((unit, index) => ({ unit, index, speed: unit.stats.speed || unit.stats.spd }))
        .sort((a, b) => b.speed - a.speed)
        .map(item => ({
            unit: item.unit,
            isPlayer: playerUnits.includes(item.unit)
        }));
}

/**
 * 执行战斗回合
 */
function executeTurn(battle, action) {
    battle.turn++;
    
    // 找到下一个活着的行动单位
    let attempts = 0;
    while (attempts < battle.turnOrder.length) {
        const currentActor = battle.turnOrder[battle.currentTurnIndex];
        if (currentActor && currentActor.unit.isAlive) {
            break;
        }
        battle.currentTurnIndex = (battle.currentTurnIndex + 1) % battle.turnOrder.length;
        attempts++;
    }
    
    const currentActor = battle.turnOrder[battle.currentTurnIndex];
    if (!currentActor || !currentActor.unit.isAlive) {
        // 所有单位都已死亡，结束战斗
        return checkBattleEnd(battle, { turn: battle.turn, status: 'active', battleLog: battle.battleLog });
    }
    
    let result = {
        turn: battle.turn,
        actor: currentActor.unit,
        action: null,
        damage: 0,
        target: null,
        status: 'active',
        battleLog: battle.battleLog
    };
    
    // 处理状态效果
    processStatusEffects(currentActor.unit);
    
    if (!currentActor.unit.isAlive) {
        battle.battleLog.push({
            type: 'unit_death',
            unit: currentActor.unit.name,
            message: `${currentActor.unit.name} 因状态效果死亡`
        });
        battle.currentTurnIndex = (battle.currentTurnIndex + 1) % battle.turnOrder.length;
        return checkBattleEnd(battle, result);
    }
    
    // 执行行动
    if (action.type === 'attack') {
        const target = findTarget(battle, action.targetId, !currentActor.isPlayer);
        if (target && target.isAlive) {
            const damage = calculateDamage(currentActor.unit, target, 1.0);
            target.currentHp = Math.max(0, target.currentHp - damage);
            
            result.action = 'attack';
            result.damage = damage;
            result.target = target;
            
            battle.battleLog.push({
                type: 'attack',
                attacker: currentActor.unit.name,
                target: target.name,
                damage: damage,
                message: `${currentActor.unit.name} 攻击 ${target.name}，造成 ${damage} 点伤害`
            });
            
            if (target.currentHp <= 0) {
                target.isAlive = false;
                battle.battleLog.push({
                    type: 'unit_death',
                    unit: target.name,
                    message: `${target.name} 被击败`
                });
            }
        }
    } else if (action.type === 'skill') {
        // 技能系统（后续实现）
        result.action = 'skill';
        battle.battleLog.push({
            type: 'skill',
            unit: currentActor.unit.name,
            skill: action.skillId,
            message: `${currentActor.unit.name} 使用技能`
        });
    }
    
    // 移动到下一个行动单位
    battle.currentTurnIndex = (battle.currentTurnIndex + 1) % battle.turnOrder.length;
    
    // 检查战斗是否结束
    return checkBattleEnd(battle, result);
}

/**
 * 查找目标
 */
function findTarget(battle, targetId, isOpponent) {
    const units = isOpponent ? battle.opponentUnits : battle.playerUnits;
    return units.find(unit => unit.id === targetId || unit.heroId === targetId);
}

/**
 * 处理状态效果
 */
function processStatusEffects(unit) {
    unit.statusEffects = unit.statusEffects.filter(effect => {
        effect.duration--;
        if (effect.duration <= 0) {
            return false;
        }
        
        // 处理持续伤害等效果
        if (effect.type === 'poison') {
            const damage = Math.floor(unit.maxHp * 0.05);
            unit.currentHp = Math.max(0, unit.currentHp - damage);
        }
        
        return true;
    });
    
    if (unit.currentHp <= 0) {
        unit.isAlive = false;
    }
}

/**
 * 检查战斗是否结束
 */
function checkBattleEnd(battle, result) {
    const playerAlive = battle.playerUnits.some(unit => unit.isAlive);
    const opponentAlive = battle.opponentUnits.some(unit => unit.isAlive);
    
    if (!playerAlive) {
        battle.status = 'finished';
        battle.winner = 'opponent';
        result.status = 'finished';
        result.winner = 'opponent';
        battle.battleLog.push({
            type: 'battle_end',
            winner: 'opponent',
            message: '战斗结束，对手获胜'
        });
    } else if (!opponentAlive) {
        battle.status = 'finished';
        battle.winner = 'player';
        result.status = 'finished';
        result.winner = 'player';
        battle.battleLog.push({
            type: 'battle_end',
            winner: 'player',
            message: '战斗结束，玩家获胜'
        });
    }
    
    return result;
}

module.exports = {
    calculateElementMultiplier,
    calculateDamage,
    initializeBattle,
    executeTurn
};
