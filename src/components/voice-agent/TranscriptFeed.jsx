import { useEffect, useRef } from 'react';
import '../../styles/TranscriptFeed.css';

export function TranscriptFeed({ messages = [], isSpeaking }) {
  const scrollEndRef = useRef(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSpeaking]);

  return (
    <div className="transcript-column-container">
      <div className="transcript-header-wrap">
        <h3 className="transcript-title">TRANSCRIPCIÓN EN TIEMPO REAL</h3>
      </div>

      <div className="transcript-cards-stack">
        {messages.length === 0 ? (
          <div className="transcript-empty-card">
            <div className="empty-card-top">
              <div className="empty-status-dot" />
              <span className="empty-card-status">Sistema Listo</span>
            </div>
            <p className="empty-card-text">
              La transcripción de la conversación con el cliente aparecerá aquí en tiempo real una vez inicies la simulación.
            </p>
          </div>
        ) : (
          messages.map((item) => {
            const isUser = item.source === 'user';
            return (
              <div key={item.id} className="transcript-floating-card">
                <div className="card-top-row">
                  <div className="card-speaker-meta">
                    <div className={`speaker-avatar-circle ${isUser ? 'user-avatar' : 'customer-avatar'}`}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="card-speaker-label">{isUser ? '[Tú]' : '[Cliente]'}</span>
                  </div>
                  <span className="card-timestamp">{item.time || 'Ahora'}</span>
                </div>
                <p className="card-message-text">{item.text}</p>
              </div>
            );
          })
        )}

        {isSpeaking && (
          <div className="transcript-floating-card typing-card">
            <div className="card-top-row">
              <div className="card-speaker-meta">
                <div className="speaker-avatar-circle customer-avatar">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span className="card-speaker-label">[Cliente]</span>
              </div>
              <span className="typing-status-tag">Hablando...</span>
            </div>
            <div className="typing-dots-wave">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={scrollEndRef} />
      </div>
    </div>
  );
}
