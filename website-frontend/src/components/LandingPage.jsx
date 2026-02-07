export function LandingPage({ onNavigate }) {
  return (
    <>
      <header style={{ 
        height: '72px', 
        borderBottom: '1px solid var(--border-subtle)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(15, 15, 20, 0.8)',
        backdropFilter: 'blur(20px)',
        zIndex: 100
      }}>
        <div className="container" style={{ 
          height: '100%', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ 
            fontWeight: 700, 
            fontSize: '1.5rem', 
            letterSpacing: '-0.05em',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Finio.
          </div>
          <nav style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => onNavigate('login')}
              className="btn-outline" 
              style={{ 
                border: 'none',
                padding: '0.5rem 1rem',
                color: 'var(--text-secondary)',
                background: 'transparent'
              }}
            >
              Войти
            </button>
            <button 
              onClick={() => onNavigate('register')}
              className="btn btn-primary" 
              style={{ padding: '0.5rem 1.5rem' }}
            >
              Регистрация
            </button>
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: 700, 
          marginBottom: '24px',
          lineHeight: 1.2
        }}>
          Управляйте финансами <br />
          <span style={{ 
            background: 'var(--gradient-primary)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            с умом и стилем
          </span>
        </h1>
        
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--text-secondary)', 
          maxWidth: '600px', 
          margin: '0 auto 48px' 
        }}>
          Простой, красивый и мощный инструмент для учета личных расходов. 
          Анализируйте бюджет, ставьте цели и достигайте финансовой свободы.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <button 
            onClick={() => onNavigate('register')}
            className="btn btn-primary" 
            style={{ padding: '16px 32px', fontSize: '1.1rem' }}
          >
            Начать бесплатно
          </button>
          <button 
            onClick={() => onNavigate('login')}
            className="btn btn-outline" 
            style={{ padding: '16px 32px', fontSize: '1.1rem' }}
          >
            Войти в аккаунт
          </button>
        </div>

        <div style={{ 
          marginTop: '80px', 
          background: 'rgba(30,41,59,0.5)', 
          width: '100%', 
          height: '500px', 
          borderRadius: '20px', 
          border: '1px solid var(--border-subtle)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <p style={{ color: 'var(--text-secondary)' }}>Dashboard Preview</p>
        </div>

        <section style={{ marginTop: '100px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Аналитика</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Визуализация расходов и доходов с помощью графиков
            </p>
          </div>
          
          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💳</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Счета</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Управление несколькими счетами и картами
            </p>
          </div>
          
          <div className="card">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎯</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Цели</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Планирование накоплений и достижение целей
            </p>
          </div>
        </section>
      </main>

      <footer style={{ 
        marginTop: '100px', 
        padding: '40px 0', 
        borderTop: '1px solid var(--border-subtle)', 
        textAlign: 'center', 
        color: 'var(--text-secondary)' 
      }}>
        <p>&copy; 2026 Finio. Все права защищены.</p>
      </footer>
    </>
  );
}