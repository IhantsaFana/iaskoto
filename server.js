import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import chatRoutes from './routes/chat.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', chatRoutes);

// Route de base pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur le chatbot scout iAskoto!',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Route de santé (health check)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Route webhook pour Messenger (à implémenter)
app.get('/webhook', (req, res) => {
  res.json({
    message: 'Webhook endpoint - GET',
    info: 'Cette route sera utilisée pour la vérification du webhook Messenger'
  });
});

app.post('/webhook', (req, res) => {
  res.json({
    message: 'Webhook endpoint - POST',
    info: 'Cette route recevra les messages de Messenger'
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: err.message
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://0.0.0.0:${PORT}`);
  console.log(`⚡ Environnement: ${process.env.NODE_ENV || 'development'}`);
});
