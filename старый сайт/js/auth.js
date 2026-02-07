document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const errorMsg = document.getElementById('error-msg');

    const API_BASE = '../backend/api/auth'; // Relative path from auth/*.html pages

    function showError(message) {
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
        } else {
            alert(message);
        }
    }

    async function handleAuth(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Произошла ошибка');
            }

            return result;
        } catch (error) {
            showError(error.message);
            return null;
        }
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());

            // Simple client-side validation
            if (data.password.length < 8) {
                showError('Пароль должен быть не менее 8 символов');
                return;
            }

            const result = await handleAuth(`${API_BASE}/register.php`, data);

            if (result) {
                // Success - redirect to login
                window.location.href = 'login.html';
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            const result = await handleAuth(`${API_BASE}/login.php`, data);

            if (result && result.token) {
                localStorage.setItem('auth_token', result.token);
                localStorage.setItem('user_name', result.user.name);
                window.location.href = '../dashboard.html';
            }
        });
    }

    // Logout Helper
    window.logout = function () {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_name');
        window.location.href = 'auth/login.html'; // Assuming calling from root (dashboard)
    };
});
