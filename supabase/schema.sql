-- ==============================================================================
-- SCHEMA SUPABASE: CONTROL DE 1 SOLO INTENTO POR USUARIO (BOT TRAINING)
-- Ejecuta este script en el SQL Editor de tu consola de Supabase
-- ==============================================================================

-- 1. Crear tabla de intentos de usuario
CREATE TABLE IF NOT EXISTS public.user_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT one_attempt_per_user UNIQUE (user_id)
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.user_attempts ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acceso (RLS):

-- Política: Los usuarios autenticados pueden consultar su propio intento
CREATE POLICY "Users can view own attempt"
  ON public.user_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios autenticados pueden registrar su intento inicial
CREATE POLICY "Users can insert own attempt"
  ON public.user_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios autenticados pueden actualizar su intento a completed
CREATE POLICY "Users can update own attempt"
  ON public.user_attempts
  FOR UPDATE
  USING (auth.uid() = user_id);
