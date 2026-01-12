import express from 'express';
import { findRelevantKnowledge } from '../services/knowledgeService.js';
import { generateAIResponse } from '../services/aiService.js';
import { saveMessageToHistory, getUserHistory } from '../services/googleSheetsService.js';

const router = express.Router();

/**
 * Endpoint de test pour discuter avec iAskoto sans passer par Messenger
 */
router.post('/test-chat', async (req, res) => {
    const { message, userId } = req.body;
    const apiKey = req.headers['x-api-key'];

    // Vérification de la sécurité
    if (!apiKey || apiKey !== process.env.APP_API_KEY) {
        return res.status(401).json({ error: "Accès non autorisé : clé API manquante ou invalide" });
    }

    if (!message) {
        return res.status(400).json({ error: "Le message est requis" });
    }

    // --- LOGIQUE D'ACTIVATION (TRIGGER) ---
    const cleanMessage = message.trim().toLowerCase();
    if (cleanMessage === "ia skoto") {
        const welcomeMessage = "Finaritra! Inona ny afaka anampiana an'ise ?";

        // Optionnel: sauvegarder quand même dans l'historique
        if (userId) {
            await saveMessageToHistory(userId, message, welcomeMessage);
        }

        return res.json({
            reply: welcomeMessage,
            contextUsed: false
        });
    }

    try {
        // 1. Chercher dans la base de connaissance Sheets
        const context = await findRelevantKnowledge(message);

        // 2. Récupérer l'historique récent (mémoire)
        let history = [];
        if (userId) {
            history = await getUserHistory(userId);
        }

        // 3. Générer la réponse avec Gemini (en incluant contexte et historique)
        const aiResponse = await generateAIResponse(message, context, history);

        // 4. Sauvegarder dans l'historique Sheets
        if (userId) {
            await saveMessageToHistory(userId, message, aiResponse);
        }

        res.json({
            reply: aiResponse,
            contextUsed: !!context
        });
    } catch (error) {
        console.error("Erreur Chat Route:", error);
        res.status(500).json({ error: "Une erreur est survenue lors du traitement du message" });
    }
});

export default router;
