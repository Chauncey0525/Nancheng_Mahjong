import React, { useState } from 'react';
import { playerAPI } from '../services/api';
import './LoginPage.css';

function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let response;
            if (isRegister) {
                response = await playerAPI.register(username, password);
            } else {
                response = await playerAPI.login(username, password);
            }
            
            // 后端返回格式: { success: true, message: '...', data: player }
            if (response && response.success && response.data) {
                onLogin(response.data);
            } else {
                setError(response?.error || response?.message || '操作失败');
            }
        } catch (err) {
            // 处理不同类型的错误
            let errorMessage = '操作失败';
            
            // Axios错误结构: err.response.data 包含后端返回的错误信息
            if (err.response?.data) {
                const errorData = err.response.data;
                if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            // 特殊处理网络错误
            if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                errorMessage = '请求超时，请检查后端服务器是否正常运行';
            } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
                errorMessage = '无法连接到服务器，请确保后端服务已启动（http://localhost:3001）';
            } else if (err.response?.status === 404) {
                errorMessage = 'API端点不存在，请检查后端路由配置';
            }
            
            setError(errorMessage);
            console.error('登录/注册错误:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>{isRegister ? '注册' : '登录'}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>用户名</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={isRegister ? "3-30个字符，支持字母、数字、下划线、连字符、点号" : ""}
                            required
                            disabled={loading}
                            minLength={isRegister ? 3 : undefined}
                            maxLength={isRegister ? 30 : undefined}
                        />
                        {isRegister && (
                            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                用户名长度3-30个字符，只能包含字母、数字、下划线(_)、连字符(-)和点号(.)
                            </small>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label>密码</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isRegister ? "至少8个字符，建议包含大小写字母和数字" : ""}
                            required
                            disabled={loading}
                            minLength={isRegister ? 8 : undefined}
                            maxLength={isRegister ? 128 : undefined}
                        />
                        {isRegister && (
                            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                密码至少8个字符，不能包含空格，建议包含大小写字母和数字
                            </small>
                        )}
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <button type="submit" disabled={loading}>
                        {loading ? '处理中...' : (isRegister ? '注册' : '登录')}
                    </button>
                </form>
                
                <button 
                    type="button" 
                    className="switch-mode"
                    onClick={() => {
                        setIsRegister(!isRegister);
                        setError('');
                    }}
                >
                    {isRegister ? '已有账号？点击登录' : '没有账号？点击注册'}
                </button>
            </div>
        </div>
    );
}

export default LoginPage;
