# 🚀 Guide de Démarrage ChatIA

## Ce qui a été créé

Vous avez maintenant une **interface de chatbot moderne et fluide** avec:

### 📦 Structure complète
```
chatbot-new/
├── index.html          # Interface utilisateur
├── styles.css          # Design moderne (19 KB)
├── chat.js             # Logique principale (19 KB)
├── roles.js            # 5 rôles du chatbot (4.4 KB)
├── storage.js          # Gestion localStorage (5 KB)
├── api.js              # Intégration APIs (6.8 KB)
├── README.md           # Documentation complète
└── GETTING_STARTED.md  # Ce fichier
```

## ✨ Fonctionnalités principales

### 1. **5 Rôles distincts**
- 👨‍🏫 **Professeur** - Enseignement enthousiaste
- 🤖 **Assistant** - Réponses efficaces
- 🎯 **Mentor** - Motivation et coaching
- 🔬 **Chercheur** - Expertise approfondie
- ✍️ **Créateur** - Création et imagination

Chaque rôle a son **propre style et approche** définis dans `roles.js`.

### 2. **Historique des conversations**
- Sauvegarde automatique dans localStorage
- Accès rapide aux 20 dernières conversations
- Gestion complète (créer, charger, supprimer)

### 3. **Configuration des APIs**
- Claude AI (Anthropic) - Meilleure qualité
- Gemini (Google) - Gratuit et efficace
- Google Custom Search - Recherche web

### 4. **Design moderne et fluide**
- Responsive (mobile/tablette/desktop)
- Animations élégantes
- Variables CSS pour personnalisation
- Mode sombre supporté

## 🎯 Comment utiliser

### Étape 1: Lancer l'application

```bash
cd /home/rebootconseil/projects/workspace/chatbot-new

# Servir avec Python
python3 -m http.server 3000

# Ou avec un serveur Node.js si disponible
npx http-server -p 3000
```

### Étape 2: Ouvrir dans le navigateur

Accédez à: **http://localhost:3000**

Vous verrez:
- 👈 Sidebar avec historique et rôles
- 💬 Zone de chat centrale
- ⚙️ Bouton de configuration

### Étape 3: Configurer (optionnel mais recommandé)

1. Cliquez sur ⚙️
2. Entrez une clé Claude (gratuit à l'inscription)
3. Cliquez "Enregistrer"

**Sans clé API**: L'app fonctionne en mode basique

**Avec Claude**: Réponses professionnelles et recherche web

### Étape 4: Commencer à chatter

1. Sélectionnez un **rôle** dans la sidebar
2. Tapez un message
3. Appuyez sur Entrée

## 📊 Structure du code

### `roles.js` - Définition des rôles
```javascript
const CHATBOT_ROLES = {
  professeur: {
    name: "Professeur",
    icon: "👨‍🏫",
    description: "...",
    systemPrompt: "Instructions pour l'IA...",
    examples: [...]
  }
}
```

### `storage.js` - Données persistantes
- `saveApiKeys()` - Enregistrer les clés API
- `getConversations()` - Récupérer l'historique
- `saveConversation()` - Sauvegarder une conversation
- `createConversation()` - Créer une nouvelle conversation

### `api.js` - Intégration IA
- `callClaudeAPI()` - Appel à Claude
- `callGeminiAPI()` - Appel à Gemini
- `searchGoogle()` - Recherche web
- `getWeather()` - Météo
- `safeMathEval()` - Calculs sécurisés

### `chat.js` - Logique principale
- Gestion des événements utilisateur
- Rendu des messages
- Changement de rôle
- Gestion de l'historique
- Gestion de la sidebar responsive

## 🎨 Personnalisation

### Changer les couleurs

Éditez `styles.css`:
```css
:root {
  --primary: #6366f1;      /* Bleu violet */
  --secondary: #8b5cf6;    /* Violet */
  --accent: #ec4899;       /* Rose */
}
```

### Ajouter un nouveau rôle

Éditez `roles.js`:
```javascript
const CHATBOT_ROLES = {
  // ... existant ...
  monRole: {
    name: "Mon Rôle",
    icon: "🎨",
    description: "Description courte",
    systemPrompt: `Tu es... (instructions pour l'IA)`,
    examples: ["Exemple question 1", "Exemple 2"]
  }
};
```

Puis ajoutez le bouton dans `index.html`:
```html
<button class="role-btn" data-role="monRole">
  <span class="role-icon">🎨</span>
  <span class="role-name">Mon Rôle</span>
</button>
```

## 🔐 Données et sécurité

- ✅ **Tout en local**: localStorage, aucun serveur
- ✅ **Privé**: Les clés API ne quittent pas votre navigateur
- ✅ **Sûr**: Validation des entrées, pas de eval()
- ✅ **Permanent**: Données persistantes

## 📱 Responsive design

| Écran | Comportement |
|-------|-------------|
| **Desktop (>768px)** | Sidebar toujours visible |
| **Tablette (600-768px)** | Sidebar rétractable |
| **Mobile (<600px)** | Sidebar en drawer |

## 🧪 Tests

Tous les fichiers JS ont été validés:
- ✅ roles.js
- ✅ storage.js
- ✅ api.js
- ✅ chat.js

## 📚 Copié du chatbot-old

Avez-vous remarqué? Nous avons **conservé** les meilleures parties:

✅ **Système de leçons complet** (dans les prompts)
✅ **Configuration d'API** (Claude, Gemini, Google)
✅ **Météo** (Open-Meteo API)
✅ **Calculs mathématiques** (sécurisés)
✅ **Styles professionnels** (mais modernes)
✅ **Fonctionnalités étendues** (rôles, historique, etc.)

## 🔄 Prochaines étapes (optionnel)

1. **Déployer**: Mettre en ligne sur Netlify/Vercel
2. **Exporter**: Ajouter fonction d'export JSON
3. **Thèmes**: Ajouter plus de thèmes visuels
4. **Intégrations**: Ajouter plus de services
5. **PWA**: Rendre l'app installable

## 💡 Conseils d'utilisation

- **Pour réviser**: Utilisez le rôle **Professeur**
- **Pour rechercher**: Utilisez le rôle **Chercheur**
- **Pour créer**: Utilisez le rôle **Créateur**
- **Pour brainstormer**: Utilisez le rôle **Mentor**
- **Pour général**: Utilisez l'**Assistant**

## ✅ À retenir

- 🎯 L'app est **fonctionnelle et prête**
- 🚀 Servez-la sur le port de votre choix
- 🔑 Configurez une clé Claude pour le meilleur résultat
- 💾 Tout est sauvegardé localement
- 📱 Ça marche sur tous les appareils

---

**Bon courage! 🚀**

Des questions? Consultez le README.md ou explorez le code source!
