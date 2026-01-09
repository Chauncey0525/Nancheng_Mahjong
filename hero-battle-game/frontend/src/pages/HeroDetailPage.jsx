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

    const elementColors = {
        '金': '#FFD700',
        '木': '#90EE90',
        '水': '#87CEEB',
        '火': '#FF6347',
        '土': '#CD853F'
    };

    return (
        <div className="hero-detail-page">
            <Link to="/heroes" className="back-link">← 返回列表</Link>
            
            <div className="hero-detail">
                <div className="hero-header">
                    <div className="hero-avatar">
                        <div 
                            className="element-badge" 
                            style={{ backgroundColor: elementColors[hero.hero.element] || '#999' }}
                        >
                            {hero.hero.element}
                        </div>
                        <div className="star-badge">{'★'.repeat(hero.hero.star)}</div>
                    </div>
                    <div className="hero-info">
                        <h2>{hero.hero.name}</h2>
                        {hero.hero.dynasty && <p className="dynasty">{hero.hero.dynasty}</p>}
                        {hero.hero.templeName && <p className="title">庙号: {hero.hero.templeName}</p>}
                        {hero.hero.posthumousName && <p className="title">谥号: {hero.hero.posthumousName}</p>}
                        {hero.hero.eraName && <p className="title">年号: {hero.hero.eraName}</p>}
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
                            <span className="stat-label">攻击</span>
                            <span className="stat-value">{hero.stats.atk}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">防御</span>
                            <span className="stat-value">{hero.stats.def}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">速度</span>
                            <span className="stat-value">{hero.stats.spd}</span>
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
