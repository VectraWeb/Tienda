// Sistema de autenticación seguro para Gaming Club
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('gamingclub_users')) || [
            {
                id: 1,
                username: 'admin',
                password: this.hashPassword('admin123'),
                email: 'admin@gamingclub.com',
                role: 'admin',
                createdAt: new Date().toISOString(),
                lastLogin: null
            }
        ];
        this.currentUser = null;
        this.maxAttempts = 5;
        this.lockoutTime = 15 * 60 * 1000; // 15 minutos
        this.failedAttempts = JSON.parse(localStorage.getItem('gamingclub_failed_attempts')) || {};
        
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
        this.createParticles('auth-particles');
    }

    // Hash seguro de contraseñas (simulado para este ejemplo)
    hashPassword(password) {
        // En un entorno real, usaríamos bcrypt o similar
        return btoa(unescape(encodeURIComponent(password))) + '_gamingclub_salt';
    }

    // Verificar contraseña
    verifyPassword(inputPassword, storedHash) {
        const hashedInput = this.hashPassword(inputPassword);
        return hashedInput === storedHash;
    }

    // Verificar si la IP está bloqueada
    isIPLocked(ip) {
        const attempts = this.failedAttempts[ip];
        if (!attempts) return false;

        const now = Date.now();
        if (attempts.count >= this.maxAttempts && 
            now - attempts.lastAttempt < this.lockoutTime) {
            return true;
        }

        // Limpiar intentos antiguos
        if (now - attempts.lastAttempt > this.lockoutTime) {
            delete this.failedAttempts[ip];
            localStorage.setItem('gamingclub_failed_attempts', JSON.stringify(this.failedAttempts));
            return false;
        }

        return false;
    }

    // Registrar intento fallido
    recordFailedAttempt(ip) {
        if (!this.failedAttempts[ip]) {
            this.failedAttempts[ip] = {
                count: 0,
                lastAttempt: Date.now()
            };
        }

        this.failedAttempts[ip].count++;
        this.failedAttempts[ip].lastAttempt = Date.now();
        localStorage.setItem('gamingclub_failed_attempts', JSON.stringify(this.failedAttempts));
    }

    // Limpiar intentos fallidos después de un login exitoso
    clearFailedAttempts(ip) {
        if (this.failedAttempts[ip]) {
            delete this.failedAttempts[ip];
            localStorage.setItem('gamingclub_failed_attempts', JSON.stringify(this.failedAttempts));
        }
    }

    // Obtener IP del cliente (simulado)
    getClientIP() {
        // En un entorno real, esto vendría del servidor
        return 'client_' + Math.random().toString(36).substr(2, 9);
    }

    // Iniciar sesión
    async login(username, password, rememberMe = false) {
        const ip = this.getClientIP();

        // Verificar si la IP está bloqueada
        if (this.isIPLocked(ip)) {
            throw new Error('Demasiados intentos fallidos. Por favor, espere 15 minutos antes de intentar nuevamente.');
        }

        // Buscar usuario
        const user = this.users.find(u => u.username === username);
        if (!user) {
            this.recordFailedAttempt(ip);
            throw new Error('Credenciales inválidas');
        }

        // Verificar contraseña
        if (!this.verifyPassword(password, user.password)) {
            this.recordFailedAttempt(ip);
            throw new Error('Credenciales inválidas');
        }

        // Login exitoso
        this.clearFailedAttempts(ip);
        user.lastLogin = new Date().toISOString();
        this.currentUser = user;

        // Guardar sesión
        if (rememberMe) {
            localStorage.setItem('gamingclub_session', JSON.stringify({
                userId: user.id,
                token: this.generateToken(),
                expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 días
            }));
        } else {
            sessionStorage.setItem('gamingclub_session', JSON.stringify({
                userId: user.id,
                token: this.generateToken(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
            }));
        }

        // Actualizar usuarios en localStorage
        localStorage.setItem('gamingclub_users', JSON.stringify(this.users));

        return user;
    }

    // Cerrar sesión
    logout() {
        this.currentUser = null;
        localStorage.removeItem('gamingclub_session');
        sessionStorage.removeItem('gamingclub_session');
        window.location.href = 'index.html';
    }

    // Verificar sesión existente
    checkExistingSession() {
        let session = sessionStorage.getItem('gamingclub_session') || 
                     localStorage.getItem('gamingclub_session');

        if (session) {
            session = JSON.parse(session);
            
            // Verificar expiración
            if (Date.now() > session.expiresAt) {
                this.logout();
                return;
            }

            const user = this.users.find(u => u.id === session.userId);
            if (user && this.verifyToken(session.token)) {
                this.currentUser = user;
                
                // Redirigir si estamos en la página de login
                if (window.location.pathname.includes('login.html')) {
                    window.location.href = 'admin.html';
                }
            }
        } else if (window.location.pathname.includes('admin.html')) {
            // Redirigir a login si no hay sesión
            window.location.href = 'login.html';
        }
    }

    // Generar token seguro (simulado)
    generateToken() {
        return 'gamingclub_token_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
    }

    // Verificar token (simulado)
    verifyToken(token) {
        return token && token.startsWith('gamingclub_token_');
    }

    // Crear partículas para el fondo
    createParticles(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--neon-blue);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${6 + Math.random() * 6}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
                opacity: ${0.3 + Math.random() * 0.4};
            `;
            container.appendChild(particle);
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        const passwordToggle = document.getElementById('password-toggle');
        const passwordInput = document.getElementById('password');
        const loginBtn = document.getElementById('login-btn');

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }

        if (passwordToggle && passwordInput) {
            passwordToggle.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Cambiar icono
                const icon = passwordToggle.querySelector('svg');
                if (type === 'text') {
                    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
                } else {
                    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
                }
            });
        }
    }

    // Manejar proceso de login
    async handleLogin() {
        const loginForm = document.getElementById('login-form');
        const loginBtn = document.getElementById('login-btn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnSpinner = loginBtn.querySelector('.btn-spinner');

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // Validación básica
        if (!username || !password) {
            this.showAlert('Error', 'Por favor, completa todos los campos', 'error');
            return;
        }

        try {
            // Mostrar estado de carga
            loginBtn.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'block';

            // Intentar login
            await this.login(username, password, rememberMe);
            
            // Mostrar éxito y redirigir
            this.showAlert('Éxito', 'Inicio de sesión exitoso', 'success');
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);

        } catch (error) {
            this.showAlert('Error', error.message, 'error');
        } finally {
            // Restaurar botón
            loginBtn.disabled = false;
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
        }
    }

    // Mostrar alertas
    showAlert(title, message, type = 'info') {
        const alertContainer = document.getElementById('alert-container');
        if (!alertContainer) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        alert.innerHTML = `
            <div class="alert-icon">${icons[type]}</div>
            <div class="alert-content">
                <div class="alert-title">${title}</div>
                <div class="alert-message">${message}</div>
            </div>
            <button class="alert-close">✕</button>
        `;

        alertContainer.appendChild(alert);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => alert.remove(), 300);
            }
        }, 5000);

        // Cerrar manualmente
        alert.querySelector('.alert-close').addEventListener('click', () => {
            alert.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => alert.remove(), 300);
        });
    }
}

// Inicializar sistema de autenticación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});