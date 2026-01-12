import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Configuration de l'authentification Google
let auth;

if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    // Mode Production (Vercel) : Utilise le JSON stocké dans une variable d'environnement
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
} else {
    // Mode Développement local : Utilise le fichier physique
    auth = new google.auth.GoogleAuth({
        keyFile: path.join(process.cwd(), 'credentials.json'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
}

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

/**
 * Récupère toutes les données de la base de connaissances
 */
export const getKnowledgeBase = async () => {
    try {
        const range = 'BaseConnaissances!A2:D';
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('Aucune donnée trouvée dans la base de connaissances.');
            return [];
        }

        return rows.map(row => ({
            categorie: row[0] || '',
            sujet: row[1] || '',
            contenu: row[2] || '',
            motsCles: row[3] ? row[3].split(',').map(kw => kw.trim().toLowerCase()) : []
        }));
    } catch (error) {
        console.error('Erreur lors de la récupération de la base de connaissances:', error);
        return [];
    }
};

/**
 * Sauvegarder l'historique d'une conversation
 */
export const saveMessageToHistory = async (userId, userMessage, aiResponse) => {
    try {
        const range = 'Historique!A:D';
        const values = [
            [new Date().toISOString(), userId, userMessage, aiResponse]
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'historique:', error);
    }
};

/**
 * Récupère les derniers messages d'un utilisateur pour donner du contexte à l'IA
 */
export const getUserHistory = async (userId, limit = 5) => {
    try {
        const range = 'Historique!A2:D'; // On suppose Colonne B = UserId, C = Message, D = Réponse
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) return [];

        // Filtrer par userId et prendre les derniers messages
        const userRows = rows
            .filter(row => row[1] === userId)
            .slice(-limit);

        return userRows.map(row => ({
            user: row[2],
            ai: row[3]
        }));
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique utilisateur:', error);
        return [];
    }
};
