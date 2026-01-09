import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage({ player }) {
    return (
        <div className="home-page">
            <div className="welcome-section">
                <h2>欢迎, {player.username}!</h2>
                <p>等级: {player.level} | 经验: {player.exp}</p>
            </div>
            
            <div className="menu-grid">
                <Link to="/heroes" className="menu-card">
                    <div className="menu-icon">⚔️</div>
                    <h3>我的英雄</h3>
                    <p>查看和管理你的英雄</p>
                </Link>
                
                <Link to="/battle" className="menu-card">
                    <div className="menu-icon">🎯</div>
                    <h3>战斗</h3>
                    <p>开始战斗，提升实力</p>
                </Link>
                
                <Link to="/gacha" className="menu-card">
                    <div className="menu-icon">🎴</div>
                    <h3>抽卡</h3>
                    <p>招募新的英雄</p>
                </Link>
                
                <div className="menu-card disabled">
                    <div className="menu-icon">🏆</div>
                    <h3>排行榜</h3>
                    <p>即将开放</p>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
