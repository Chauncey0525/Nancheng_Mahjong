import React, { useState, useEffect } from 'react';
import { gachaAPI, playerAPI } from '../services/api';
import './GachaPage.css';

function GachaPage({ playerId, player }) {
    const [playerData, setPlayerData] = useState(player);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        loadPlayerData();
    }, [playerId]);

    const loadPlayerData = async () => {
        try {
            const data = await playerAPI.getPlayerById(playerId);
            setPlayerData(data);
        } catch (err) {
            console.error('加载玩家数据失败:', err);
        }
    };

    const handleSinglePull = async (useGems = false) => {
        if (!playerData) return;
        
        const cost = useGems ? 10 : 100;
        const resource = useGems ? 'gems' : 'coins';
        
        if (playerData[resource] < cost) {
            setError(`资源不足，需要${cost}${useGems ? '宝石' : '金币'}`);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const data = await gachaAPI.singlePull(playerId, useGems);
            setResult(data);
            await loadPlayerData(); // 刷新玩家数据
        } catch (err) {
            setError(err.message || '抽卡失败');
        } finally {
            setLoading(false);
        }
    };

    const handleMultiPull = async (useGems = false) => {
        if (!playerData) return;
        
        const cost = useGems ? 90 : 900;
        const resource = useGems ? 'gems' : 'coins';
        
        if (playerData[resource] < cost) {
            setError(`资源不足，需要${cost}${useGems ? '宝石' : '金币'}`);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const data = await gachaAPI.multiPull(playerId, useGems);
            setResult(data);
            await loadPlayerData(); // 刷新玩家数据
        } catch (err) {
            setError(err.message || '抽卡失败');
        } finally {
            setLoading(false);
        }
    };

    if (!playerData) {
        return <div className="loading">加载中...</div>;
    }

    return (
        <div className="gacha-page">
            <div className="gacha-header">
                <h2>英雄招募</h2>
                <div className="resources">
                    <span>金币: {playerData.coins}</span>
                    <span>宝石: {playerData.gems}</span>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="gacha-options">
                <div className="gacha-card">
                    <h3>单抽</h3>
                    <div className="costs">
                        <button 
                            onClick={() => handleSinglePull(false)}
                            disabled={loading || playerData.coins < 100}
                        >
                            100 金币
                        </button>
                        <button 
                            onClick={() => handleSinglePull(true)}
                            disabled={loading || playerData.gems < 10}
                        >
                            10 宝石
                        </button>
                    </div>
                </div>

                <div className="gacha-card">
                    <h3>十连抽</h3>
                    <p className="discount">9折优惠</p>
                    <div className="costs">
                        <button 
                            onClick={() => handleMultiPull(false)}
                            disabled={loading || playerData.coins < 900}
                        >
                            900 金币
                        </button>
                        <button 
                            onClick={() => handleMultiPull(true)}
                            disabled={loading || playerData.gems < 90}
                        >
                            90 宝石
                        </button>
                    </div>
                </div>
            </div>

            {loading && <div className="loading">抽卡中...</div>}

            {result && (
                <div className="gacha-result">
                    <h3>抽卡结果</h3>
                    {result.results ? (
                        // 十连抽结果
                        <div className="result-grid">
                            {result.results.map((item, index) => (
                                <div key={index} className={`result-item star-${item.star}`}>
                                    <div className="star-display">{'★'.repeat(item.star)}</div>
                                    <p>英雄ID: {item.heroId}</p>
                                    {item.alreadyOwned && <span className="owned-badge">已拥有</span>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        // 单抽结果
                        <div className={`result-item star-${result.star}`}>
                            <div className="star-display">{'★'.repeat(result.star)}</div>
                            <p>英雄ID: {result.heroId}</p>
                            {result.alreadyOwned && <span className="owned-badge">已拥有</span>}
                        </div>
                    )}
                </div>
            )}

            <div className="gacha-rates">
                <h3>抽卡概率</h3>
                <ul>
                    <li>五星: 1%</li>
                    <li>四星: 9%</li>
                    <li>三星: 30%</li>
                    <li>二星: 40%</li>
                    <li>一星: 20%</li>
                </ul>
            </div>
        </div>
    );
}

export default GachaPage;
