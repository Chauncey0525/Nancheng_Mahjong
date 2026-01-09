import React from 'react';
import { Link } from 'react-router-dom';
import './HeroCard.css';

function HeroCard({ hero }) {
    // 属性颜色（参考宝可梦）
    const elementColors = {
        '普通': '#A8A878',
        '火': '#F08030',
        '水': '#6890F0',
        '草': '#78C850',
        '木': '#78C850',
        '电': '#F8D030',
        '冰': '#98D8D8',
        '格斗': '#C03028',
        '毒': '#A040A0',
        '地面': '#E0C068',
        '飞行': '#A890F0',
        '超能力': '#F85888',
        '虫': '#A8B820',
        '岩石': '#B8A038',
        '幽灵': '#705898',
        '暗': '#705848',
        '龙': '#7038F8',
        '钢': '#B8B8D0',
        '金': '#FFD700',
        '土': '#D4A574'
    };

    // 角色定位颜色
    const roleColors = {
        '战士': '#C03028',
        '刺客': '#705848',
        '法师': '#F85888',
        '治疗': '#78C850',
        '坦克': '#B8B8D0',
        '射手': '#F08030',
        '辅助': '#6890F0'
    };

    return (
        <Link to={`/heroes/${hero.id}`} className="hero-card">
            <div className="hero-card-header">
                <div 
                    className="element-badge" 
                    style={{ backgroundColor: elementColors[hero.hero.element] || '#A8A878' }}
                >
                    {hero.hero.element}
                </div>
                <div 
                    className="role-badge" 
                    style={{ backgroundColor: roleColors[hero.hero.role] || '#999' }}
                >
                    {hero.hero.role}
                </div>
            </div>
            <div className="hero-card-body">
                <h3>{hero.hero.name}</h3>
                {hero.hero.title && <p className="title">{hero.hero.title}</p>}
                {hero.hero.dynasty && <p className="dynasty">{hero.hero.dynasty}</p>}
                <div className="hero-level">Lv.{hero.level}</div>
            </div>
            <div className="hero-card-stats">
                <div className="stat">
                    <span>HP</span>
                    <span>{hero.stats.hp}</span>
                </div>
                <div className="stat">
                    <span>物攻</span>
                    <span>{hero.stats.physAtk || hero.stats.atk || 0}</span>
                </div>
                <div className="stat">
                    <span>法攻</span>
                    <span>{hero.stats.magicAtk || 0}</span>
                </div>
                <div className="stat">
                    <span>速度</span>
                    <span>{hero.stats.speed || hero.stats.spd || 0}</span>
                </div>
            </div>
        </Link>
    );
}

export default HeroCard;
