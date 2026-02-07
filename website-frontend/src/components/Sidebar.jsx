export function Sidebar({ user }) {
  const menuItems = [
    {
      href: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
      label: 'Дашборд',
      active: true
    },
    {
      href: '/income',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      label: 'Доходы'
    },
    {
      href: '/expenses',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
        </svg>
      ),
      label: 'Расходы'
    },
    {
      href: '/assets',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a.5.5 0 000 1h6a.5.5 0 000-1H9z" />
        </svg>
      ),
      label: 'Счета'
    },
    {
      href: '/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09 1.25-.109 2.281 1.419 2.281 2.91 0 1.492-1.031 3.02-2.281 2.92zm4.12-1.78l-1.46-3.12c-.276-.588-.344-1.25-.195-1.876C12.986 8.52 13.522 8 14.168 8h.61c1.234 0 2.27.957 2.378 2.19l.716 8.216c.097 1.11-.78 1.99-1.895 1.99a2.375 2.375 0 01-1.893-2.618l.205-1.72z" />
        </svg>
      ),
      label: 'Настройки'
    }
  ];

  const handleLogout = () => {
    if (confirm('Выйти из аккаунта?')) {
      // Очистить данные пользователя и перенаправить
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_name');
      window.location.href = '/';
    }
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="logo">Finio.</div>
      
      <nav className="nav-menu">
        {menuItems.map((item, index) => (
          <a 
            key={index}
            href={item.href} 
            className={`nav-item ${item.active ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.avatar || user?.name?.[0] || 'U'}
          </div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {user?.name || 'Пользователь'}
            </div>
            <div 
              style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)', 
                cursor: 'pointer' 
              }}
              onClick={handleLogout}
            >
              Выйти
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}