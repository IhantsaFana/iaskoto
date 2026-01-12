import { getKnowledgeBase } from './googleSheetsService.js';

/**
 * Recherche les informations pertinentes dans la base de connaissances
 * en fonction du message de l'utilisateur.
 */
export const findRelevantKnowledge = async (userMessage) => {
    const knowledgeBase = await getKnowledgeBase();
    if (!knowledgeBase || knowledgeBase.length === 0) return "";

    const messageLower = userMessage.toLowerCase();

    // Filtrage simple : on cherche si des mots-clés ou le sujet apparaissent dans le message
    const relevantEntries = knowledgeBase.filter(entry => {
        // Vérifier si le sujet est mentionné
        if (messageLower.includes(entry.sujet.toLowerCase())) return true;

        // Vérifier si un des mots-clés est présent
        return entry.motsCles.some(kw => messageLower.includes(kw));
    });

    if (relevantEntries.length === 0) {
        return "";
    }

    // On formate les résultats pour les injecter dans le prompt
    let context = "\nVoici des informations extraites de la base de connaissances scoute malagasy :\n";
    relevantEntries.forEach(entry => {
        context += `--- SUJET: ${entry.sujet} (${entry.categorie}) ---\n`;
        context += `${entry.contenu}\n\n`;
    });

    return context;
};
