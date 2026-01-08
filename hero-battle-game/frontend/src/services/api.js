import axios from 'axios';

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 创建axios实例
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
api.interceptors.request.use(
    config => {
        // 可以在这里添加token等认证信息
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    response => {
        return response.data;
    },
    error => {
        console.error('API错误:', error);
        return Promise.reject(error);
    }
);

// 英雄相关API
export const heroAPI = {
    // 获取所有英雄
    getAllHeroes: () => api.get('/heroes'),
    
    // 获取英雄详情
    getHeroById: (id) => api.get(`/heroes/${id}`),
    
    // 搜索英雄
    searchHeroes: (query) => api.get(`/heroes/search/${query}`)
};

// 玩家相关API
export const playerAPI = {
    // 注册
    register: (username, password) => api.post('/players/register', { username, password }),
    
    // 登录
    login: (username, password) => api.post('/players/login', { username, password }),
    
    // 获取玩家信息
    getPlayerById: (id) => api.get(`/players/${id}`),
    
    // 获取玩家的英雄列表
    getPlayerHeroes: (id) => api.get(`/players/${id}/heroes`)
};

// 战斗相关API
export const battleAPI = {
    // 开始战斗
    startBattle: (battleData) => api.post('/battles/start', battleData),
    
    // 执行战斗回合
    executeTurn: (battleId, action) => api.post('/battles/turn', { battleId, action }),
    
    // 获取战斗记录
    getBattleHistory: (playerId) => api.get(`/battles/history/${playerId}`)
};

// 抽卡相关API
export const gachaAPI = {
    // 单抽
    singlePull: (playerId, useGems = false) => api.post('/gacha/single', { playerId, useGems }),
    
    // 十连抽
    multiPull: (playerId, useGems = false) => api.post('/gacha/multi', { playerId, useGems })
};

export default api;
