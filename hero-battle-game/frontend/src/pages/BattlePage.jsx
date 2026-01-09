import React, { useState } from 'react';
import BattleArena from '../components/BattleArena';
import './BattlePage.css';

function BattlePage({ playerId }) {
    const [battleMode, setBattleMode] = useState(null);

    if (battleMode) {
        return (
            <BattleArena 
                playerId={playerId}
                battleMode={battleMode}
                onExit={() => setBattleMode(null)}
            />
        );
    }

    return (
        <div className="battle-page">
            <h2>选择战斗模式</h2>
            <div className="battle-modes">
                <div className="battle-mode-card" onClick={() => setBattleMode('pve_story')}>
                    <h3>剧情模式</h3>
                    <p>挑战关卡，解锁剧情</p>
                </div>
                <div className="battle-mode-card" onClick={() => setBattleMode('pve_arena')}>
                    <h3>竞技场</h3>
                    <p>挑战AI对手</p>
                </div>
                <div className="battle-mode-card disabled">
                    <h3>排位赛</h3>
                    <p>即将开放</p>
                </div>
                <div className="battle-mode-card disabled">
                    <h3>好友对战</h3>
                    <p>即将开放</p>
                </div>
            </div>
        </div>
    );
}

export default BattlePage;
