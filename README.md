# ChatIA - Chatbot Intelligent Moderne

Une application web de chat interactive avec support de plusieurs rôles et intégration d'APIs d'IA.

## 🚀 Démarrage rapide

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Python 3 (optionnel, pour servir l'application)

### Installation

```bash
# Cloner ou extraire les fichiers dans un dossier
cd chatbot-new

# Servir l'application avec Python
python3 -m http.server 3000

# Puis ouvrir dans le navigateur
# http://localhost:3000
```

## 📋 Structure des fichiers

```
chatbot-new/
├── index.html       # Structure HTML principale
├── styles.css       # Styles modernes et responsive
├── chat.js          # Logique principale du chatbot
├── roles.js         # Définitions des rôles
├── storage.js       # Gestion du localStorage
├── api.js           # Appels aux APIs externes
└── README.md        # Ce fichier
```

## ✨ Fonctionnalités principales

### 🎭 5 Rôles disponibles

1. **👨‍🏫 Professeur** - Enseignant particulier enthousiaste
   - Explications pédagogiques
   - Exemples concrets
   - Guidance bienveillante

2. **🤖 Assistant** - Assistant polyvalent et efficace
   - Réponses claires et structurées
   - Multi-domaines
   - Pratique et utile

3. **🎯 Mentor** - Coach de croissance personnelle
   - Motivation et inspiration
   - Questions réflexives
   - Célébration des progrès

4. **🔬 Chercheur** - Expert en analyse approfondie
   - Explications scientifiques
   - Nuances et sources
   - Perspective équilibrée

5. **✍️ Créateur** - Compagnon créatif
   - Brainstorming
   - Écriture créative
   - Idées originales

### 💬 Gestion des conversations

- **Historique**: Accédez à vos 20 dernières conversations
- **Nouveau chat**: Lancez une nouvelle conversation avec `+`
- **Sauvegarde automatique**: Toutes les conversations sont sauvegardées
- **Changement de rôle**: Basculez entre rôles sans perdre l'historique

### 🔐 Configuration des APIs

Cliquez sur ⚙️ pour configurer vos clés API:

#### Claude AI (Anthropic) - **Recommandé**
- La meilleure précision et compréhension
- Accès à la recherche web
- [Obtenir une clé](https://console.anthropic.com)

#### Gemini AI (Google)
- Gratuit (1500 req/jour)
- Rapide et efficace
- [Obtenir une clé](https://aistudio.google.com/apikey)

#### Google Custom Search
- Pour la recherche web avancée
- Optionnel
- [Obtenir une clé](https://console.cloud.google.com)

### 📱 Design Responsive

L'application s'adapte à tous les écrans:
- **Desktop**: Sidebar toujours visible
- **Tablette**: Sidebar rétractable
- **Mobile**: Sidebar en drawer (menu coulissant)

## 🛠️ Utilisation

### Démarrer une conversation

1. Sélectionnez un **rôle** dans la barre latérale
2. Tapez votre message dans la zone de saisie
3. Appuyez sur Entrée ou cliquez sur Envoyer

### Gérer les conversations

- **Voir l'historique**: Cliquez sur une conversation dans la sidebar
- **Créer nouveau**: Cliquez sur le bouton `+`
- **Changer de rôle**: Cliquez sur un rôle différent

### Configurer les APIs

1. Cliquez sur ⚙️ (Paramètres)
2. Entrez vos clés API
3. Cliquez sur "Enregistrer"
4. Pour supprimer: Cliquez sur "Effacer"

## 💾 Données et Stockage

- **localStorage**: Toutes les données sont stockées localement
- **Privé**: Aucune donnée ne quitte votre navigateur
- **Permanent**: Les données persistent même après fermeture
- **Exportable**: Vous pouvez exporter votre historique (feature future)

## 🎨 Personnalisation

### Modifier les couleurs

Éditez les variables CSS dans `styles.css`:

```css
:root {
  --primary: #6366f1;        /* Couleur principale */
  --secondary: #8b5cf6;      /* Couleur secondaire */
  --accent: #ec4899;         /* Couleur d'accent */
}
```

### Ajouter de nouveaux rôles

Éditez `roles.js`:

```javascript
const CHATBOT_ROLES = {
  monRole: {
    name: "Mon Rôle",
    icon: "🎨",
    description: "Ma description",
    systemPrompt: "Instructions pour l'IA...",
    examples: ["Exemple 1", "Exemple 2"]
  }
};
```

## 🔧 Développement

### Technologies utilisées

- **HTML5**: Structure sémantique
- **CSS3**: Grid, Flexbox, Variables CSS
- **JavaScript ES6+**: Moderne et modulaire
- **LocalStorage API**: Persistance des données

### Architecture

- **Modulaire**: Chaque fonctionnalité dans son fichier
- **Réactif**: Mises à jour en temps réel
- **Efficace**: Chargement minimal des ressources
- **Accessible**: Standards web respectés

### Amélioration des performances

- ✅ CSS variables pour thème dynamique
- ✅ Lazy loading des images
- ✅ Debouncing des événements
- ✅ Compression du historique

## 🐛 Dépannage

### "Les réponses sont limitées"
→ Configurez une clé API Claude ou Gemini

### "Mes conversations ne s'affichent pas"
→ Vérifiez que le localStorage n'est pas désactivé
→ Essayez de vider le cache du navigateur

### "Le chat ne répond pas"
→ Vérifiez votre connexion internet
→ Vérifiez que la clé API est valide
→ Consultez la console (F12) pour les erreurs

## 📚 Cas d'utilisation

- 🎓 **Étudiants**: Révisions avec le rôle Professeur
- 💼 **Professionnels**: Recherche et analyses avec le rôle Chercheur
- 🎨 **Créatifs**: Brainstorming avec le rôle Créateur
- 🚀 **Entrepreneurs**: Mentorat avec le rôle Mentor
- 🤖 **Tous**: Questions générales avec l'Assistant

## 📝 Licence

Ce projet est fourni tel quel. Libre d'utilisation et de modification.

## 🤝 Contribution

Les améliorations sont bienvenues! N'hésitez pas à:
- Ajouter de nouveaux rôles
- Améliorer le design
- Ajouter des fonctionnalités
- Corriger des bugs

## 📞 Support

Pour toute question ou problème:
1. Consultez ce README
2. Vérifiez la console (F12)
3. Vérifiez que les fichiers sont tous présents

---

**Créé avec ❤️ - ChatIA v1.0**
