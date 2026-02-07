import { useState } from 'react';

export function RegisterForm({ onRegister, onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Валидация
      if (!formData.name || !formData.email || !formData.password) {
        setError('Заполните все поля');
        return;
      }

      if (formData.password.length < 6) {
        setError('Пароль должен быть не менее 6 символов');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }

      // Mock регистрация - заменить на реальный API вызов
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onRegister({
        name: formData.name,
        email: formData.email,
        token: 'mock-token-' + Date.now()
      });
    } catch (err) {
      setError('Ошибка регистрации. Попробуйте еще раз.');
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
          Создать аккаунт
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
            <label htmlFor="name" className="form-label">Имя</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Ваше имя"
            />
          </div>

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
              placeholder="Минимум 6 символов"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Подтвердите пароль</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Повторите пароль"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Создание...' : 'Создать аккаунт'}
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
            Уже есть аккаунт? 
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
            Войти
          </button>
        </div>
      </div>
    </div>
  );
}