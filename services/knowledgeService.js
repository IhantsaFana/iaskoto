import { getKnowledgeBase } from './googleSheetsService.js';
import { getEmbedding, cosineSimilarity } from './embeddingService.js';

// Cache simple pour éviter de re-générer les vecteurs à chaque message
let knowledgeCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Charge et vectorise la base de connaissance
 */
const getVectorizedKnowledge = async () => {
    const now = Date.now();

    // Si le cache est valide, on le retourne
    if (knowledgeCache && (now - lastCacheUpdate < CACHE_DURATION)) {
        return knowledgeCache;
    }

    const rawKnowledge = await getKnowledgeBase();
    const vectorized = [];

    console.log("Vectorisation de la base de connaissances en cours...");

    for (const item of rawKnowledge) {
        // On combine Catégorie, Sujet et Contenu pour un meilleur embedding
        const textToEmbed = `${item.categorie} - ${item.sujet}: ${item.contenu}`;
        const vector = await getEmbedding(textToEmbed);

        if (vector) {
            vectorized.push({ ...item, vector });
        }
    }

    knowledgeCache = vectorized;
    lastCacheUpdate = now;
    console.log(`Vectorisation terminée: ${vectorized.length} éléments en cache.`);
    return vectorized;
};

/**
 * Recherche sémantique dans la base de connaissance
 */
export const findRelevantKnowledge = async (userMessage) => {
    try {
        const knowledgeBase = await getVectorizedKnowledge();
        if (knowledgeBase.length === 0) return "";

        // Vectoriser la question de l'utilisateur
        const queryVector = await getEmbedding(userMessage);
        if (!queryVector) return "";

        // Calculer la similitude avec chaque élément de la base
        const results = knowledgeBase.map(item => ({
            ...item,
            score: cosineSimilarity(queryVector, item.vector)
        }));

        // Trier par score et filtrer (seuil de 0.4 pour la pertinence)
        const relevantEntries = results
            .filter(item => item.score > 0.4)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3); // On prend les 3 meilleurs résultats

        if (relevantEntries.length === 0) return "";

        // Formater pour l'IA
        let context = "\nVoici des informations pertinentes de la base de connaissances Tily :\n";
        relevantEntries.forEach(entry => {
            console.log(`DEBUG: Match trouvé "${entry.sujet}" avec score: ${entry.score.toFixed(4)}`);
            context += `[${entry.sujet}] : ${entry.contenu}\n`;
        });

        return context;
    } catch (error) {
        console.error("Erreur findRelevantKnowledge:", error);
        return "";
    }
};
