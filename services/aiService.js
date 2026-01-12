import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

console.log("Démarrage du service AI avec la clé :", process.env.GOOGLE_AI_API_KEY ? (process.env.GOOGLE_AI_API_KEY.substring(0, 5) + "...") : "MANQUANTE");

const SYSTEM_PROMPT = `
Tu es "iAskoto", un assistant expert "Tily eto Madagasikara". 
Ton ton est fraternel, direct et naturel (comme une discussion sur Messenger).

CONSIGNES DE STYLE :
1. **BRIÈVETÉ** : Sois très concis. Évite les longs discours. 2 à 3 phrases suffisent généralement.
2. **SIMPLE & CLAIR** : Pas de mots compliqués. Va droit au but.
3. **NATUREL** : Parle comme un grand frère scout. Utilise quelques emojis pour être amical ⛺️.
4. **EXACTITUDE** : Reste précis sur les faits (Tily = Protestante, Antily = Catholique).

SIGNATURE :
Termine toujours par une courte formule scoute (ex: "Vonona amin'ny Fiainana", "Tily Tsara!").
`;

export const generateAIResponse = async (userMessage, contextData, chatHistory = []) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: SYSTEM_PROMPT // Passer les consignes ici pour le mode Chat
        });

        // Transformer l'historique Sheets en format Gemini
        const formattedHistory = [];
        chatHistory.forEach(chat => {
            formattedHistory.push({ role: 'user', parts: [{ text: chat.user }] });
            formattedHistory.push({ role: 'model', parts: [{ text: chat.ai }] });
        });

        const chatSession = model.startChat({
            history: formattedHistory,
        });

        // On ajoute le contexte facultatif au message de l'utilisateur
        const finalMessage = contextData
            ? `CONTEXTURE : ${contextData}\n\nQUESTION : ${userMessage}`
            : userMessage;

        const result = await chatSession.sendMessage(finalMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Erreur Gemini AI:", error);
        return "Miala tsiny, nisy olana kely tamin'ny fitaovako. Afaka averinao ve ny fanontaniana? (Erreur technique de l'IA)";
    }
};
