# 📖 Documentation de l'API - OEKA Mikofo

**OEKA Mikofo** est une API de Chatbot intelligent spécialisé dans le mouvement scout **Tily eto Madagasikara**. Elle utilise Node.js (Express), Google Sheets pour le stockage des connaissances et de l'historique, et l'IA Google Gemini (2.0 Flash) pour la génération des réponses.

## 🚀 Configuration de Base

- **Base URL** : `http://votre-serveur:3000`
- **Format** : JSON (Entrées et Sorties)

### Authentification
Toutes les requêtes vers les endpoints de chat doivent inclure une clé API dans les headers :
- **Header** : `x-api-key`
- **Valeur** : Définie dans votre fichier `.env` (`APP_API_KEY`)

---

## 📡 Endpoints

### 1. Chat et IA (Principal)
C'est l'endpoint utilisé par Make.com ou pour les tests.

- **URL** : `/api/test-chat`
- **Méthode** : `POST`
- **Headers** : 
    - `Content-Type: application/json`
    - `x-api-key: <votre_cle_secrete>`

#### Corps de la requête (Request Body)
```json
{
  "message": "Envoie ici le texte de l'utilisateur",
  "userId": "ID_unique_utilisateur_messenger"
}
```

#### Déclencheur spécial (Trigger)
Si le message est exactement **"ia Skoto"**, l'API renvoie une réponse automatique pré-définie sans appeler l'IA.
- **Réponse** : `"Finaritra! Inona ny afaka anampiana an'ise ?"`

#### Réponse de l'API (Success Response)
```json
{
  "reply": "Texte de la réponse générée",
  "contextUsed": true // true si l'info vient de votre Google Sheet, false sinon
}
```

---

### 2. Utilitaires
- **`GET /health`** : Vérifie si le serveur est en ligne et fonctionnel.
- **`GET /`** : Affiche les informations de base de l'API.

---

## 📊 Configuration Google Sheets

L'API nécessite un Google Spreadsheet avec l'ID configuré dans le `.env`. Le tableur doit contenir obligatoirement deux onglets :

### Onglet 1 : `BaseConnaissances`
Utilisé pour le RAG (vectorisation des connaissances).
- **A : Catégorie** (ex: Histoire)
- **B : Sujet** (ex: 1922)
- **C : Contenu** (Texte de référence pour l'IA)
- **D : Mots-clés** (Facultatif, aide à la recherche)

### Onglet 2 : `Historique`
Utilisé pour la mémoire du bot.
- **A : Date** (Géré par l'API)
- **B : UserId** (PSID Messenger)
- **C : Message** (Message envoyé)
- **D : Réponse** (Réponse d'OEKA Mikofo)

---

## ⛺️ Spécificités Scouts Tily

- **Vocabulaire** : L'IA est instruite pour utiliser systématiquement le tutoiement fraternel Tily : **"ise"** et **"an'ise"**.
- **Multilingue** : L'API détecte automatiquement la langue de l'utilisateur (FR, MG, EN, etc.) et répond dans la même langue, même si la source dans Sheets est en Malagasy.
- **Mémoire** : L'IA récupère les 5 derniers échanges pour chaque utilisateur afin de garder le fil de la conversation.

---

## 🔗 Intégration Make.com

1. **Trigger** : Module "Messenger - Watch Messages".
2. **Action** : Module "HTTP - Make a request".
    - **URL** : `http://VOTRE_IP:3000/api/test-chat`
    - **Method** : `POST`
    - **Headers** : `x-api-key` = `votre_cle`
    - **Body (JSON)** :
        - `message` : `{{sender_message_text}}`
        - `userId` : `{{sender_id}}`
3. **Action** : Module "Messenger - Send a Message".
    - **Recipient ID** : `{{sender_id}}`
    - **Text** : `{{data.reply}}`

---

## 🛠️ Maintenance

- **Redémarrage** : `npm start` ou `npm run dev` (avec nodemon).
- **Mise à jour des connaissances** : Ajoutez simplement des lignes dans la Google Sheet. Elles seront prises en compte après expiration du cache (15 min) ou redémarrage.
