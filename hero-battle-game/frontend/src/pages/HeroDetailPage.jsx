import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { playerAPI } from '../services/api';
import './HeroDetailPage.css';

function HeroDetailPage({ playerId }) {
    const { id } = useParams();
    const [hero, setHero] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadHero();
    }, [id, playerId]);

    const loadHero = async () => {
        try {
            setLoading(true);
            const heroes = await playerAPI.getPlayerHeroes(playerId);
            const foundHero = heroes.find(h => h.id === parseInt(id) || h.heroId === parseInt(id));
            if (foundHero) {
                setHero(foundHero);
            } else {
                setError('英雄不存在');
            }
        } catch (err) {
            setError(err.message || '加载英雄详情失败');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">加载中...</div>;
    }

    if (error || !hero) {
        return (
            <div className="error">
                {error || '英雄不存在'}
                <Link to="/heroes">返回英雄列表</Link>
            </div>
        );
    }

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
        <div className="hero-detail-page">
            <Link to="/heroes" className="back-link">← 返回列表</Link>
            
            <div className="hero-detail">
                <div className="hero-header">
                    <div className="hero-avatar">
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
                    <div className="hero-info">
                        <h2>{hero.hero.name}</h2>
                        {hero.hero.title && <p className="title">称号: {hero.hero.title}</p>}
                        {hero.hero.dynasty && <p className="dynasty">朝代: {hero.hero.dynasty}</p>}
                    </div>
                </div>
                
                <div className="hero-stats">
                    <h3>属性</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">等级</span>
                            <span className="stat-value">{hero.level}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">生命</span>
                            <span className="stat-value">{hero.stats.hp}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">物攻</span>
                            <span className="stat-value">{hero.stats.physAtk || hero.stats.atk || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">法攻</span>
                            <span className="stat-value">{hero.stats.magicAtk || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">物抗</span>
                            <span className="stat-value">{hero.stats.physDef || hero.stats.def || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">法抗</span>
                            <span className="stat-value">{hero.stats.magicDef || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">速度</span>
                            <span className="stat-value">{hero.stats.speed || hero.stats.spd || 0}</span>
                        </div>
                    </div>
                </div>
                
                {hero.hero.bio && (
                    <div className="hero-bio">
                        <h3>生平</h3>
                        <p>{hero.hero.bio}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HeroDetailPage;
