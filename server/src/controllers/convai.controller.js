import { supabaseAdmin } from '../supabase.js';

export async function getSignedUrl(req, res) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (!apiKey || !agentId) {
      return res.status(500).json({
        error: 'Configuración incompleta: Asegúrate de definir ELEVENLABS_API_KEY y ELEVENLABS_AGENT_ID en el archivo .env del servidor.',
      });
    }

    // 1. Verificación de seguridad de 1 solo intento si Supabase Admin está configurado
    const authHeader = req.headers.authorization;
    if (supabaseAdmin && authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (!authError && userData?.user) {
        const userId = userData.user.id;

        // Consultar el estado del intento del usuario
        const { data: attempt, error: dbError } = await supabaseAdmin
          .from('user_attempts')
          .select('status')
          .eq('user_id', userId)
          .maybeSingle();

        if (dbError) {
          console.error('[Backend] Error al consultar intentos:', dbError.message);
        }

        if (attempt?.status === 'completed') {
          return res.status(403).json({
            error: 'Acceso denegado: Ya has completado tu único intento de entrenamiento permitido.',
          });
        }

        // Registrar o actualizar a in_progress
        await supabaseAdmin
          .from('user_attempts')
          .upsert({
            user_id: userId,
            status: 'in_progress',
            started_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      }
    }

    // 2. Solicitar Signed URL a ElevenLabs API según documentación oficial
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ElevenLabs API Error]:', response.status, errorText);
      return res.status(response.status).json({
        error: `Error al obtener Signed URL de ElevenLabs: ${response.statusText}`,
        details: errorText,
      });
    }

    const data = await response.json();
    return res.json({ signedUrl: data.signed_url });
  } catch (error) {
    console.error('[Backend Error getSignedUrl]:', error);
    return res.status(500).json({
      error: 'Error interno al generar la URL firmada.',
      details: error.message,
    });
  }
}

export async function completeAttempt(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!supabaseAdmin || !authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado o Supabase Admin no configurado.' });
    }

    const token = authHeader.split(' ')[1];
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !userData?.user) {
      return res.status(401).json({ error: 'Token de autenticación inválido.' });
    }

    const userId = userData.user.id;

    const { error: updateError } = await supabaseAdmin
      .from('user_attempts')
      .upsert({
        user_id: userId,
        status: 'completed',
        ended_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (updateError) {
      console.error('[Backend] Error al marcar intento como completado:', updateError);
      return res.status(500).json({ error: 'Error al actualizar el intento.' });
    }

    return res.json({ success: true, message: 'Intento registrado como completado.' });
  } catch (error) {
    console.error('[Backend Error completeAttempt]:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
