import { useState } from 'react';
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
            let player;
            if (isRegister) {
                player = await playerAPI.register(username, password);
            } else {
                player = await playerAPI.login(username, password);
            }
            
            if (player) {
                onLogin(player);
            } else {
                setError('登录失败，请检查用户名和密码');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || '操作失败');
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
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>密码</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
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
