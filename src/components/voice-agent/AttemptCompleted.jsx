import '../../styles/AttemptCompleted.css';

export function AttemptCompleted({ attempt, onSignOut }) {
  const formattedDate = attempt?.ended_at
    ? new Date(attempt.ended_at).toLocaleString()
    : 'Registrado recientemente';

  return (
    <div className="completed-card">
      {/* Encabezado de Marca */}
      <div className="completed-brand-header">
        <div className="brand-infinity">
          <svg className="infinity-icon" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sales-ai-gradient-completed" x1="4" y1="40" x2="40" y2="4" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E53935" />
                <stop offset="1" stopColor="#D32F2F" />
              </linearGradient>
            </defs>
            <path
              d="M12 28C8.5 24 8.5 16 13.5 11.5C18 7.5 25.5 7.5 29.5 9.5"
              stroke="url(#sales-ai-gradient-completed)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M32 16C35.5 20 35.5 28 30.5 32.5C26 36.5 18.5 36.5 14.5 34.5"
              stroke="url(#sales-ai-gradient-completed)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M16 28L28 16M28 16H20M28 16V24"
              stroke="url(#sales-ai-gradient-completed)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="brand-title">SALES TRAINING AI</span>
        </div>
      </div>

      <div className="completed-icon-wrapper">
        <div className="completed-icon-circle">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <h2>¡Evaluación Finalizada!</h2>
      <p className="completed-subtitle">
        Has completado tu único intento de entrenamiento permitido para esta sesión. Tu desempeño ha sido registrado satisfactoriamente.
      </p>

      <div className="completed-details">
        <div className="detail-row">
          <span className="detail-label">Estado de la sesión:</span>
          <span className="badge badge-success">Completado con Éxito</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Fecha y hora de cierre:</span>
          <span className="detail-value">{formattedDate}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Intentos restantes:</span>
          <span className="detail-value highlight">0 de 1 intento</span>
        </div>
      </div>

      <div className="completed-notice-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p>
          Tus respuestas y transcripción de voz han sido procesadas de forma segura. Si necesitas solicitar una reapertura o revisión de tu caso, contacta a tu evaluador.
        </p>
      </div>

      <div className="completed-actions">
        <button type="button" onClick={onSignOut} className="btn-secondary">
          Finalizar y Salir
        </button>
      </div>
    </div>
  );
}
