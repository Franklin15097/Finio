import { useState } from 'react';
import { api } from '../utils/api';

export function LoginForm({ onLogin, onBack }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // РЕАЛЬНЫЙ API вызов
      const response = await api.login({
        email: formData.email,
        password: formData.password
      });
      
      onLogin({
        name: response.user.name,
        email: response.user.email,
        token: response.token
      });
    } catch (err) {
      setError('Неверный email или пароль');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 700, 
          marginBottom: '0.5rem',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          💎 Finio
        </div>
        
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          Вход в аккаунт
        </h2>

        {error && (
          <div style={{ 
            background: 'var(--danger-bg)', 
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={onBack}
            className="btn btn-ghost"
            style={{ marginRight: '1rem' }}
          >
            ← Назад
          </button>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Нет аккаунта? 
          </span>
          <button 
            onClick={() => onBack()}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--brand-primary)', 
              cursor: 'pointer',
              textDecoration: 'underline',
              marginLeft: '0.25rem'
            }}
          >
            Регистрация
          </button>
        </div>
      </div>
    </div>
  );
}