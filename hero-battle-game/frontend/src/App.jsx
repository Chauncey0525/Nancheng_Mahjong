import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// 页面组件
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import HeroListPage from './pages/HeroListPage';
import HeroDetailPage from './pages/HeroDetailPage';
import BattlePage from './pages/BattlePage';
import GachaPage from './pages/GachaPage';

function App() {
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 检查本地存储的玩家信息
        const savedPlayer = localStorage.getItem('player');
        if (savedPlayer) {
            try {
                setPlayer(JSON.parse(savedPlayer));
            } catch (e) {
                console.error('解析玩家信息失败:', e);
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = (playerData) => {
        setPlayer(playerData);
        localStorage.setItem('player', JSON.stringify(playerData));
    };

    const handleLogout = () => {
        setPlayer(null);
        localStorage.removeItem('player');
    };

    if (loading) {
        return <div className="loading">加载中...</div>;
    }

    return (
        <Router>
            <div className="app">
                <header className="app-header">
                    <h1>历史英雄养成游戏</h1>
                    {player && (
                        <div className="player-info">
                            <span>玩家: {player.username}</span>
                            <span>金币: {player.coins}</span>
                            <span>宝石: {player.gems}</span>
                            <button onClick={handleLogout}>退出</button>
                        </div>
                    )}
                </header>
                
                <main className="app-main">
                    <Routes>
                        <Route path="/" element={player ? <HomePage player={player} /> : <Navigate to="/login" />} />
                        <Route path="/login" element={player ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} />
                        <Route path="/heroes" element={player ? <HeroListPage playerId={player.id} /> : <Navigate to="/login" />} />
                        <Route path="/heroes/:id" element={player ? <HeroDetailPage playerId={player.id} /> : <Navigate to="/login" />} />
                        <Route path="/battle" element={player ? <BattlePage playerId={player.id} /> : <Navigate to="/login" />} />
                        <Route path="/gacha" element={player ? <GachaPage playerId={player.id} player={player} /> : <Navigate to="/login" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
