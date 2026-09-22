import { useState } from 'react';
import '../../styles/LoginForm.css';

export function LoginForm({ onSignIn, loading, error, onClearError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    onClearError?.();

    if (!email || !password) {
      setLocalError('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    await onSignIn(email, password);
  };

  return (
    <div className="login-wrapper">
      {/* Elementos abstractos decorativos en las esquinas */}
      <div className="bg-shape-top-left" aria-hidden="true" />
      <div className="bg-shape-bottom-right" aria-hidden="true" />

      <div className="login-split-card">
        {/* Columna Izquierda: Formulario de Inicio de Sesión */}
        <div className="login-form-col">
          <div className="login-brand-header">
            <span className="welcome-tag">BIENVENIDO A</span>
            <div className="brand-infinity">
              <svg className="infinity-icon" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="sales-ai-gradient-login" x1="4" y1="40" x2="40" y2="4" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E53935" />
                    <stop offset="1" stopColor="#D32F2F" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 28C8.5 24 8.5 16 13.5 11.5C18 7.5 25.5 7.5 29.5 9.5"
                  stroke="url(#sales-ai-gradient-login)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M32 16C35.5 20 35.5 28 30.5 32.5C26 36.5 18.5 36.5 14.5 34.5"
                  stroke="url(#sales-ai-gradient-login)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 28L28 16M28 16H20M28 16V24"
                  stroke="url(#sales-ai-gradient-login)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h1 className="brand-title">SALES TRAINING AI</h1>
            </div>
            <p className="login-subtitle">
              Simulador de clientes Claro Hogar. Pon a prueba tus habilidades de argumentación, manejo de objeciones y cierre comercial.
            </p>
          </div>

          {(error || localError) && (
            <div className="login-alert-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error || localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="modern-auth-form">
            <div className="pill-input-group">
              <span className="input-icon">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="login-email"
                type="email"
                placeholder="Username / Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>

            <div className="pill-input-group">
              <span className="input-icon">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </button>
            </div>

            <button type="submit" className="pill-submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loader">
                  <span className="pill-spinner" /> Conectando...
                </span>
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>

          <div className="single-attempt-badge">
            <span className="lock-icon">🔒</span>
            <span>Recordatorio: Dispones de <strong>1 solo intento</strong> de llamada.</span>
          </div>
        </div>

        {/* Columna Derecha: Panel Visual Rojo con Imagen / Identidad */}
        <div className="login-visual-col">
          <div className="visual-overlay" />
          <div className="visual-content">
            <svg className="visual-infinity-icon" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 28C8.5 24 8.5 16 13.5 11.5C18 7.5 25.5 7.5 29.5 9.5"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M32 16C35.5 20 35.5 28 30.5 32.5C26 36.5 18.5 36.5 14.5 34.5"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M16 28L28 16M28 16H20M28 16V24"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="visual-title">SALES TRAINING AI</h2>
            <p className="visual-text">
              Simulador comercial de clientes Claro Hogar. Entrena tu argumentación y vence las objeciones más complejas antes de llamar a clientes reales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
