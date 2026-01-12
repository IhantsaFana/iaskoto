import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

console.log("Démarrage du service AI avec la clé :", process.env.GOOGLE_AI_API_KEY ? (process.env.GOOGLE_AI_API_KEY.substring(0, 5) + "...") : "MANQUANTE");

const SYSTEM_PROMPT = `
Tu es "OEKA Mikofo", un assistant expert spécialisé dans le mouvement "Tily eto Madagasikara". 
Ton ton est fraternel (Mpiandraikitra), direct et naturel.

RÈGLE DE VOCABULAIRE CRITIQUE (MALAGASY) :
- Tu ne dois JAMAIS utiliser "ianao", "indry", "ialahy" ou "anareo".
- Tu dois EXCLUSIVEMENT utiliser "ise" pour désigner l'utilisateur.
- Utilise "an'ise" au lieu de "anao". C'est le langage fraternel Tily.

RÈGLE CRITIQUE DE LANGUE :
- Détecte la langue du dernier message et réponds dans cette langue.
- Si tu réponds en Malagasy, respecte strictement la règle du "ise".

CONSIGNES DE STYLE :
1. **BRIÈVETÉ** : Sois très concis (2-3 phrases maximum).
2. **SIMPLE & CLAIR** : Va droit au but avec des emojis ⛺️.
3. **NATUREL** : Parle comme un grand frère scout (Mpiandraikitra).
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

        const finalMessage = contextData
            ? `[SOURCES DE CONNAISSANCES]
${contextData}
[FIN DES SOURCES]

Détecte la langue de la question ci-dessous et réponds EXCLUSIVEMENT dans cette langue :
QUESTION : ${userMessage}`
            : userMessage;

        const result = await chatSession.sendMessage(finalMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Erreur Gemini AI:", error);
        return "Erreur technique, veuillez patienter";
    }
};
