import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playerAPI } from '../services/api';
import HeroCard from '../components/HeroCard';
import './HeroListPage.css';

function HeroListPage({ playerId }) {
    const [heroes, setHeroes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadHeroes();
    }, [playerId]);

    const loadHeroes = async () => {
        try {
            setLoading(true);
            const data = await playerAPI.getPlayerHeroes(playerId);
            setHeroes(data);
        } catch (err) {
            setError(err.message || '加载英雄列表失败');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">加载中...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="hero-list-page">
            <div className="page-header">
                <h2>我的英雄</h2>
                <p>共拥有 {heroes.length} 个英雄</p>
            </div>
            
            {heroes.length === 0 ? (
                <div className="empty-state">
                    <p>你还没有英雄，快去抽卡吧！</p>
                    <Link to="/gacha" className="btn-primary">前往抽卡</Link>
                </div>
            ) : (
                <div className="hero-grid">
                    {heroes.map(hero => (
                        <HeroCard key={hero.id} hero={hero} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default HeroListPage;
