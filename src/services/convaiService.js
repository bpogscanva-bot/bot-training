/**
 * Servicio para interactuar con el microservicio de backend de ElevenLabs y estado de intentos.
 */

export async function fetchSignedUrl(accessToken) {
  const headers = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch('/api/convai/signed-url', {
    method: 'GET',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener la sesión de voz con ElevenLabs.');
  }

  return data.signedUrl;
}

export async function markAttemptAsCompleted(accessToken) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch('/api/convai/complete-attempt', {
    method: 'POST',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error al registrar la finalización del intento.');
  }

  return data;
}
