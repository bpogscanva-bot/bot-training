import '../../styles/AgentTelemetry.css';

export function AgentTelemetry() {
  return (
    <div className="challenge-instructions-card">
      <div className="instructions-header">
        <span className="instructions-title">INSTRUCCIONES DEL RETO</span>
      </div>

      <div className="instructions-steps-list">
        <div className="instruction-step">
          <div className="step-circle-badge">1.</div>
          <div className="step-label-text">
            Manejo de objeción sobre velocidad y datos
          </div>
        </div>

        <div className="instruction-step">
          <div className="step-circle-badge">2.</div>
          <div className="step-label-text">
            Presentar beneficios del nuevo plan premium
          </div>
        </div>

        <div className="instruction-step">
          <div className="step-circle-badge">3.</div>
          <div className="step-label-text">
            Cierre de prueba con oferta por tiempo limitado
          </div>
        </div>
      </div>

      {/* Bocadillo de escenario con puntero triangular superior */}
      <div className="scenario-speech-bubble">
        <div className="bubble-pointer" />
        <p className="scenario-text">
          <strong>Escenario:</strong> Migrar cliente actual a Plan Ilimitado (Consumo actual supera el límite del plan)
        </p>
      </div>

      {/* 6 Chips de Habilidades */}
      <div className="skills-tags-wrap">
        <span className="skill-chip">Empatía</span>
        <span className="skill-chip">Escucha Activa</span>
        <span className="skill-chip">Manejo de Objeciones</span>
        <span className="skill-chip">Propuesta de Valor</span>
        <span className="skill-chip">Tono y Seguridad</span>
        <span className="skill-chip">Cierre de Ventas</span>
      </div>
    </div>
  );
}
