import { useState } from 'react';
import { useConversationControls, useConversationStatus } from '@elevenlabs/react';
import '../../styles/CallControls.css';

export function CallControls({ onStartSession, isStarting, callError, callDuration = 0 }) {
  const { endSession, setVolume } = useConversationControls();
  const { status } = useConversationStatus();
  const [isMuted, setIsMuted] = useState(false);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || isStarting;

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        setVolume({ volume: next ? 0 : 1 });
      } catch (e) {
        console.warn('Set volume error:', e);
      }
      return next;
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="call-controls-container">
      {callError && (
        <div className="call-error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{callError}</span>
        </div>
      )}

      {/* Floating Pill Dock con controles esenciales de llamada (formato grande) */}
      <div className="floating-pill-dock">
        {/* 1. Botón de Micrófono */}
        <button
          type="button"
          className={`dock-btn ${isMuted ? 'muted' : ''}`}
          onClick={toggleMute}
          title={isMuted ? 'Reactivar micrófono' : 'Silenciar micrófono'}
          disabled={!isConnected}
        >
          {isMuted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        {/* 2. Botón rojo circular de llamada */}
        {isConnected ? (
          <button
            type="button"
            className="dock-main-call-btn end-active"
            onClick={endSession}
            title="Finalizar simulación"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
              <line x1="22" y1="2" x2="2" y2="22" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            className="dock-main-call-btn start-idle"
            onClick={onStartSession}
            disabled={isConnecting}
            title="Iniciar simulación"
          >
            {isConnecting ? (
              <span className="dock-call-spinner" />
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Caption en español */}
      <div className="dock-status-caption">
        {isConnected ? (
          <span className="status-caption-text">
            LLAMADA EN VIVO: SIMULACIÓN ACTIVA &nbsp;|&nbsp; {formatTime(callDuration)}
          </span>
        ) : (
          <span className="status-caption-text standby">
            EN ESPERA &nbsp;|&nbsp; LISTO PARA INICIAR
          </span>
        )}
      </div>
    </div>
  );
}
