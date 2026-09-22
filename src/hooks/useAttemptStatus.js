import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { markAttemptAsCompleted } from '../services/convaiService';

export function useAttemptStatus(user, session) {
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    if (!user) {
      return;
    }

    supabase
      .from('user_attempts')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error: dbError }) => {
        if (isCancelled) return;
        if (dbError) {
          console.warn('[useAttemptStatus] Advertencia al consultar user_attempts:', dbError.message);
        } else {
          setAttempt(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('[useAttemptStatus] Error:', err);
        setError(err.message);
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const finishAttempt = useCallback(async () => {
    if (!user) return;

    try {
      // 1. Intentar actualizar a través de Supabase directo
      const { error: directError } = await supabase
        .from('user_attempts')
        .upsert(
          {
            user_id: user.id,
            status: 'completed',
            ended_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (directError) {
        console.warn('[useAttemptStatus] Fallback al backend:', directError.message);
        // 2. Si las políticas RLS directas fallan, recurrimos al backend microservice con service_role
        if (session?.access_token) {
          await markAttemptAsCompleted(session.access_token);
        }
      }

      setAttempt((prev) => ({
        ...prev,
        user_id: user.id,
        status: 'completed',
        ended_at: new Date().toISOString(),
      }));
    } catch (err) {
      console.error('[useAttemptStatus] Error al finalizar intento:', err);
    }
  }, [user, session]);

  const isCompleted = attempt?.status === 'completed';

  return {
    attempt,
    isCompleted,
    loading: user ? loading : false,
    error,
    finishAttempt,
  };
}
