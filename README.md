# iAskoto - Chatbot Scout

Chatbot scout avec IA générative pour Messenger utilisant Google Sheets pour le stockage des bases de connaissances et des historiques.

## 🚀 Technologies

- **Backend**: Node.js + Express
- **Stockage**: Google Sheets
- **IA**: Google Gemini (à intégrer)
- **Messagerie**: Facebook Messenger

## 📁 Structure du projet

```
iaskoto/
├── config/          # Fichiers de configuration
├── routes/          # Routes Express
├── services/        # Logique métier (Google Sheets, IA, etc.)
├── utils/           # Fonctions utilitaires
├── server.js        # Point d'entrée de l'application
├── .env             # Variables d'environnement (non versionné)
├── .env.example     # Template des variables d'environnement
└── package.json     # Dépendances et scripts
```

## 🛠️ Installation

1. Cloner le projet
2. Installer les dépendances :
```bash
npm install
```

3. Copier `.env.example` vers `.env` et configurer les variables :
```bash
cp .env.example .env
```

4. Configurer les variables d'environnement dans `.env`

## 🏃 Démarrage

### Mode développement (avec auto-reload)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📡 Endpoints disponibles

- `GET /` - Page d'accueil / informations sur l'API
- `GET /health` - Health check
- `GET /webhook` - Vérification du webhook Messenger
- `POST /webhook` - Réception des messages Messenger

## 🔧 Configuration requise

### Google Sheets
- Créer un projet Google Cloud
- Activer l'API Google Sheets
- Créer des credentials (Service Account)
- Ajouter l'ID du spreadsheet dans `.env`

### Facebook Messenger
- Créer une application Facebook
- Configurer le webhook
- Obtenir le Page Access Token

## 📝 Prochaines étapes

- [ ] Intégration Google Sheets
- [ ] Intégration Messenger Webhook
- [ ] Intégration IA générative (Gemini)
- [ ] Gestion de l'historique des conversations
- [ ] Base de connaissances

## 📄 Licence

MIT
