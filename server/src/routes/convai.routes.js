import { Router } from 'express';
import { getSignedUrl, completeAttempt } from '../controllers/convai.controller.js';

const router = Router();

// Endpoint para obtener la Signed URL de ElevenLabs (valida intento)
router.get('/signed-url', getSignedUrl);

// Endpoint para marcar intento como finalizado
router.post('/complete-attempt', completeAttempt);

export default router;
