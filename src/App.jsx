import { LoginForm } from './components/auth/LoginForm';
import { VoiceWidget } from './components/voice-agent/VoiceWidget';
import { AttemptCompleted } from './components/voice-agent/AttemptCompleted';
import { useAuth } from './hooks/useAuth';
import { useAttemptStatus } from './hooks/useAttemptStatus';
import './styles/App.css';

export default function App() {
  const { user, session, loading: authLoading, error: authError, signIn, signOut, clearError } = useAuth();
  const { attempt, isCompleted, loading: attemptLoading, finishAttempt } = useAttemptStatus(user, session);

  const isLoading = authLoading || (user && attemptLoading);

  return (
    <div className="app-container">
      <main className="app-main">
        {isLoading ? (
          <div className="loading-card">
            <div className="spinner large" />
            <p>Cargando información de sesión...</p>
          </div>
        ) : !user ? (
          <LoginForm
            onSignIn={signIn}
            loading={authLoading}
            error={authError}
            onClearError={clearError}
          />
        ) : isCompleted ? (
          <AttemptCompleted
            attempt={attempt}
            onSignOut={signOut}
          />
        ) : (
          <VoiceWidget
            session={session}
            user={user}
            onSignOut={signOut}
            onAttemptFinished={finishAttempt}
          />
        )}
      </main>
    </div>
  );
}
