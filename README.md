# 🎯 Mon Tracker

**Mon Tracker** est une application web moderne et performante de suivi d'ouverture d'emails (email tracking) par pixel invisible (GIF 1×1 transparent). Elle offre un système robuste multi-utilisateurs avec isolation des données, des limites personnalisables et un tableau de bord analytique complet.

---

## ✨ Fonctionnalités Principales

*   👤 **Multi-comptes & Isolation** : Inscription sécurisée, authentification chiffrée par cookie (`iron-session`) et isolation complète des données entre les utilisateurs.
*   📊 **Tableau de Bord Analytique** : 
    *   Suivi du volume d'ouvertures quotidiennes sur les 7 derniers jours (graphique d'activité).
    *   Distribution horaire des ouvertures sur la journée.
    *   Classement des cibles (destinataires) les plus actives.
*   🎯 **Ciblage Nominatif** : Possibilité d'associer un paramètre URL (`?cible=nom_du_destinataire`) pour identifier précisément qui ouvre vos emails.
*   🛡️ **Algorithme Anti-Bruit (Gmail)** : Détection et filtrage automatique des requêtes de mise en cache effectuées par le `GoogleImageProxy` lors de la rédaction ou de l'envoi de l'email, évitant ainsi les faux positifs.
*   👑 **Super-Administration** : Panel d'administration complet pour gérer les comptes utilisateurs, configurer des limites de pixels personnalisées, réinitialiser des mots de passe et supprimer des comptes en cascade.
*   🕵️‍♂️ **Interface Discrète (Leurre)** : Page d'accueil imitant une fausse erreur 404 avec un point d'accès caché (Easter Egg) vers l'interface de connexion.
*   🌓 **Mode Sombre Automatique** : Design system minimaliste et responsive s'adaptant aux préférences système.

---

## 🛠️ Stack Technique

*   **Framework** : [Next.js 16 (Pages Router)](https://nextjs.org/) & [React 19](https://react.dev/)
*   **Base de Données** : [Vercel Postgres / Neon DB](https://vercel.com/docs/storage/vercel-postgres) (SQL performant et serverless)
*   **Authentification & Sessions** : [Iron Session](https://github.com/vvo/iron-session) (cookies signés et chiffrés) & [bcryptjs](https://www.npmjs.com/package/bcryptjs) pour le hachage des mots de passe.
*   **Identifiants** : UUID v4 pour l'anonymisation des identifiants de pixels.

---

## 📖 Documentation & Installation

Toutes les informations concernant l'architecture du projet, le schéma SQL de la base de données, la configuration des variables d'environnement ainsi que le guide d'installation locale et de déploiement sont disponibles dans le fichier de documentation technique :

👉 **[Consulter la Documentation Technique (doc.md)](./doc.md)**
