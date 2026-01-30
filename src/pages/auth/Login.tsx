import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './auth.scss';

/**
 * 登录页面
 * 当前只支持邮箱+密码登录
 * 验证码登录功能已暂时禁用（代码已保留）
 */
export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  // const { login, loginWithCode, sendVerificationCode } = useAuth(); // 完整版本

  // const [mode, setMode] = useState<'password' | 'code'>('password'); // 验证码登录已禁用
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [code, setCode] = useState(''); // 验证码登录已禁用
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const [countdown, setCountdown] = useState(0); // 验证码登录已禁用

  /* ===== 验证码发送功能 - 已暂时禁用 =====
  const handleSendCode = async () => {
    if (!email) {
      setError('请输入邮箱');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await sendVerificationCode(email, 'login');

      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  */

  // 密码登录
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('请填写完整信息');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ===== 验证码登录功能 - 已暂时禁用 =====
  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      setError('请填写完整信息');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await loginWithCode(email, code);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  */

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>登录 AI Studio</h1>

        {/* ===== 登录模式切换 - 已暂时禁用 =====
        <div className="auth-mode-tabs">
          <button
            className={mode === 'password' ? 'active' : ''}
            onClick={() => setMode('password')}
          >
            密码登录
          </button>
          <button
            className={mode === 'code' ? 'active' : ''}
            onClick={() => setMode('code')}
          >
            验证码登录
          </button>
        </div>
        */}

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handlePasswordLogin}>
          <div className="form-group">
            <label>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              required
            />
          </div>

          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />
          </div>

          {/* ===== 验证码输入 - 已暂时禁用 =====
          {mode === 'code' && (
            <div className="form-group">
              <label>验证码</label>
              <div className="code-input-group">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入验证码"
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading || countdown > 0}
                  className="send-code-btn"
                >
                  {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
                </button>
              </div>
            </div>
          )}
          */}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="auth-footer">
          还没有账号？ <Link to="/register">立即注册</Link>
        </div>
      </div>
    </div>
  );
}
