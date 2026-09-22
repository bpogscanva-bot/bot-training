import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ConversationProvider,
  useConversationControls,
  useConversationStatus,
  useConversationMode,
} from '@elevenlabs/react';
import { Orb } from './Orb';
import { LiveWaveform } from './LiveWaveform';
import { CallControls } from './CallControls';
import { TranscriptFeed } from './TranscriptFeed';
import { AgentTelemetry } from './AgentTelemetry';
import { fetchSignedUrl } from '../../services/convaiService';
import '../../styles/VoiceWidget.css';

function VoiceSessionInner({ session, user, onSignOut, messages }) {
  const { startSession, endSession } = useConversationControls();
  const { status } = useConversationStatus();
  const { isSpeaking } = useConversationMode();

  const [isStarting, setIsStarting] = useState(false);
  const [callError, setCallError] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const hasConnectedRef = useRef(false);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || isStarting;

  // Temporizador de duración de la llamada activa
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Determinar estado para el Orb de ElevenLabs
  let agentState = null;
  if (isSpeaking) {
    agentState = 'talking';
  } else if (isConnected) {
    agentState = 'listening';
  } else if (isConnecting) {
    agentState = 'thinking';
  }

  // Iniciar la sesión de voz
  const handleStartSession = async () => {
    try {
      setCallError(null);
      setCallDuration(0);
      setIsStarting(true);

      // 1. Permiso de micrófono
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micErr) {
        throw new Error('Permiso de micrófono denegado. Habilita el acceso para continuar.', { cause: micErr });
      }

      const defaultAgentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_5001m2rf4n4mf0qv7m8xa1p06n9t';

      // 2. Obtener Signed URL o fallback a agentId
      try {
        const signedUrl = await fetchSignedUrl(session?.access_token);
        await startSession({ signedUrl });
      } catch (backendErr) {
        console.warn('[VoiceWidget] Backend signed-url no disponible, fallback a agentId:', backendErr.message);
        await startSession({ agentId: defaultAgentId });
      }

      hasConnectedRef.current = true;
    } catch (err) {
      console.error('[VoiceWidget Error]:', err);
      setCallError(err.message || 'Error al conectar con el agente.');
      setIsStarting(false);
    }
  };

  return (
    <div className="voice-studio-container">
      {/* Barra Superior Compacta: Logo y Título a la izquierda, Usuario y Botón de Acción a la derecha */}
      <header className="studio-topbar">
        <div className="studio-brand">
          <div className="brand-logo-mark">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C9.37 4 4 9.37 4 16c0 4.42 2.39 8.28 5.96 10.35.58-.33 1.13-.7 1.63-1.12C8.65 23.57 7 20.02 7 16c0-4.97 4.03-9 9-9 2.49 0 4.74 1.01 6.36 2.64l2.12-2.12C22.18 5.22 19.25 4 16 4z" fill="#E53935" />
              <path d="M22.04 5.65C25.61 7.72 28 11.58 28 16c0 6.63-5.37 12-12 12-3.25 0-6.18-1.22-8.48-3.52l2.12-2.12C11.26 23.99 13.51 25 16 25c4.97 0 9-4.03 9-9 0-4.02-1.65-7.57-4.59-9.23.5-.42 1.05-.79 1.63-1.12z" fill="#E53935" />
            </svg>
          </div>
          <span className="brand-title">Sales Training AI</span>
          <span className="studio-tag">SIMULADOR CLARO</span>
        </div>

        <div className="studio-user-dock">
          <div className="user-profile-widget">
            <div className="user-avatar-circle">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="user-name-text">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Alex Thompson'}
            </span>
          </div>

          <button type="button" className="btn-icon-bell" title="Notificaciones">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="bell-badge-dot" />
          </button>

          {onSignOut && (
            <button type="button" onClick={onSignOut} className="btn-icon-logout" title="Cerrar sesión">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}

          {/* Botón principal de simulación integrado en la barra para ahorrar espacio */}
          <button
            type="button"
            className="btn-end-simulation"
            onClick={isConnected ? endSession : handleStartSession}
            disabled={isConnecting}
          >
            {isConnected ? 'FINALIZAR SIMULACIÓN' : isConnecting ? 'CONECTANDO...' : 'INICIAR SIMULACIÓN'}
          </button>
        </div>
      </header>

      {/* Cockpit de 3 Columnas ajustado a la pantalla sin scroll */}
      <div className="studio-cockpit-layout">
        {/* Columna Izquierda: Instrucciones del Reto */}
        <aside className="studio-column-left">
          <AgentTelemetry />
        </aside>

        {/* Columna Central (Hero): Orb 3D WebGL, Onda de Audio y Floating Dock */}
        <section className="studio-column-center">
          <div className="orb-display-stage">
            <div className="orb-ambient-light" />
            <Orb agentState={agentState} />
          </div>

          <LiveWaveform active={isConnected} height={36} />

          <CallControls
            onStartSession={handleStartSession}
            isStarting={isStarting}
            callError={callError}
            callDuration={callDuration}
          />
        </section>

        {/* Columna Derecha: Transcripción en Tiempo Real */}
        <aside className="studio-column-right">
          <TranscriptFeed messages={messages} isSpeaking={isSpeaking} />
        </aside>
      </div>
    </div>
  );
}

export function VoiceWidget({ session, user, onSignOut, onAttemptFinished }) {
  const hasHadActiveCallRef = useRef(false);
  const [messages, setMessages] = useState([]);

  const handleConnect = useCallback(() => {
    console.log('[ElevenLabs] Conexión establecida con el agente.');
    hasHadActiveCallRef.current = true;
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log('[ElevenLabs] Conexión finalizada.');
    if (hasHadActiveCallRef.current) {
      onAttemptFinished();
    }
  }, [onAttemptFinished]);

  const handleMessage = useCallback((msg) => {
    if (msg?.message) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          source: msg.source || 'agent',
          text: msg.message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, []);

  const handleError = useCallback((err) => {
    console.error('[ElevenLabs Provider Error]:', err);
  }, []);

  return (
    <ConversationProvider
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onMessage={handleMessage}
      onError={handleError}
    >
      <VoiceSessionInner
        session={session}
        user={user}
        onSignOut={onSignOut}
        messages={messages}
      />
    </ConversationProvider>
  );
}
