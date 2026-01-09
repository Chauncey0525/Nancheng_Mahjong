import React, { useState, useEffect } from 'react';
import { battleAPI, playerAPI } from '../services/api';
import './BattleArena.css';

function BattleArena({ playerId, battleMode, onExit }) {
    const [battle, setBattle] = useState(null);
    const [playerTeam, setPlayerTeam] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadPlayerTeam();
    }, [playerId]);

    const loadPlayerTeam = async () => {
        try {
            const heroes = await playerAPI.getPlayerHeroes(playerId);
            // 默认选择前3个英雄作为队伍
            setPlayerTeam(heroes.slice(0, 3).map(h => ({
                id: h.id,
                heroId: h.heroId,
                name: h.hero.name,
                element: h.hero.element,
                stats: h.stats,
                level: h.level
            })));
        } catch (err) {
            setError('加载队伍失败');
        }
    };

    const startBattle = async () => {
        if (playerTeam.length === 0) {
            setError('请至少选择一个英雄');
            return;
        }

        try {
            setLoading(true);
            setError('');
            // 创建AI对手队伍（临时，后续从服务器获取）
            const opponentTeam = [
                { id: 1, heroId: 1, name: 'AI英雄1', element: '火', stats: { hp: 100, atk: 50, def: 30, spd: 40 }, level: 1 },
                { id: 2, heroId: 2, name: 'AI英雄2', element: '水', stats: { hp: 90, atk: 45, def: 35, spd: 45 }, level: 1 }
            ];
            
            const battleData = await battleAPI.startBattle({
                playerId,
                playerTeam,
                opponentType: battleMode === 'pve_story' ? 'pve' : 'ai',
                opponentId: null,
                opponentTeam
            });
            
            setBattle(battleData);
        } catch (err) {
            setError(err.message || '开始战斗失败');
        } finally {
            setLoading(false);
        }
    };

    const executeAction = async (action) => {
        if (!battle || battle.status !== 'active') return;

        try {
            setLoading(true);
            const result = await battleAPI.executeTurn(battle.id, action);
            
            // 更新战斗状态
            setBattle(prev => ({
                ...prev,
                ...result,
                battleLog: result.battleLog
            }));

            if (result.status === 'finished') {
                setTimeout(() => {
                    alert(result.winner === 'player' ? '胜利！' : '失败！');
                    onExit();
                }, 2000);
            }
        } catch (err) {
            setError(err.message || '执行行动失败');
        } finally {
            setLoading(false);
        }
    };

    if (!battle) {
        return (
            <div className="battle-arena">
                <button onClick={onExit} className="exit-btn">返回</button>
                <h2>准备战斗</h2>
                {error && <div className="error">{error}</div>}
                <div className="team-selection">
                    <h3>我的队伍</h3>
                    {playerTeam.map(hero => (
                        <div key={hero.id} className="team-member">
                            <span>{hero.name}</span>
                            <span>Lv.{hero.level}</span>
                        </div>
                    ))}
                </div>
                <button onClick={startBattle} disabled={loading || playerTeam.length === 0}>
                    {loading ? '准备中...' : '开始战斗'}
                </button>
            </div>
        );
    }

    return (
        <div className="battle-arena">
            <button onClick={onExit} className="exit-btn">退出战斗</button>
            <h2>战斗进行中 - 第 {battle.turn} 回合</h2>
            
            {error && <div className="error">{error}</div>}
            
            <div className="battle-field">
                <div className="player-side">
                    <h3>我方</h3>
                    {battle.playerUnits?.map(unit => (
                        <div key={unit.id} className={`battle-unit ${!unit.isAlive ? 'dead' : ''}`}>
                            <div className="unit-name">{unit.name}</div>
                            <div className="unit-hp">
                                <div className="hp-bar">
                                    <div 
                                        className="hp-fill" 
                                        style={{ width: `${(unit.currentHp / unit.maxHp) * 100}%` }}
                                    />
                                </div>
                                <span>{unit.currentHp}/{unit.maxHp}</span>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="opponent-side">
                    <h3>敌方</h3>
                    {battle.opponentUnits?.map(unit => (
                        <div key={unit.id} className={`battle-unit ${!unit.isAlive ? 'dead' : ''}`}>
                            <div className="unit-name">{unit.name}</div>
                            <div className="unit-hp">
                                <div className="hp-bar">
                                    <div 
                                        className="hp-fill" 
                                        style={{ width: `${(unit.currentHp / unit.maxHp) * 100}%` }}
                                    />
                                </div>
                                <span>{unit.currentHp}/{unit.maxHp}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {battle.status === 'active' && (
                <div className="battle-actions">
                    <h3>选择行动</h3>
                    <div className="action-buttons">
                        {battle.playerUnits?.filter(u => u.isAlive).map(unit => (
                            <div key={unit.id} className="unit-actions">
                                <span>{unit.name}</span>
                                {battle.opponentUnits?.filter(u => u.isAlive).map(target => (
                                    <button
                                        key={target.id}
                                        onClick={() => executeAction({
                                            type: 'attack',
                                            targetId: target.id
                                        })}
                                        disabled={loading}
                                    >
                                        攻击 {target.name}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="battle-log">
                <h3>战斗日志</h3>
                <div className="log-content">
                    {battle.battleLog?.slice(-10).map((log, index) => (
                        <div key={index} className="log-entry">
                            {log.message}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default BattleArena;
