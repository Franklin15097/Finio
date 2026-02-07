class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.toast-container');
    }
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: #1A1A24;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      padding: 16px 20px;
      min-width: 280px;
      max-width: 320px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      gap: 12px;
      pointer-events: all;
      animation: slideInRight 0.3s ease-out;
      position: relative;
      overflow: hidden;
    `;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const colors = {
      success: '#00D9A3',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#6366F1'
    };

    toast.innerHTML = `
      <div style="
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: ${colors[type]};
      "></div>
      <div style="font-size: 20px; margin-left: 8px;">${icons[type]}</div>
      <div style="flex: 1; color: #FFFFFF; font-size: 0.9rem;">${message}</div>
    `;

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    return toast;
  }

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

export const toast = new ToastManager();
