/* ═══════════════════════════════════════════════════════════════════════════
   LOGIQUE PRINCIPALE DU CHATBOT
   ═══════════════════════════════════════════════════════════════════════════ */

// Réponses en cache (max 60 entrées, LRU)
const _responseCache = new Map();

// État global
let state = {
  currentRole: getCurrentRole(),
  currentPersonality: getCurrentPersonality(),
  currentConversationId: getCurrentConversationId(),
  isLoading: false,
  sidebar: {
    open: window.innerWidth > 768
  }
};

// Éléments du DOM (queried after DOM is ready)
let elements = {};

/* ═══════════════════════════════════════════════════════════════════════════
   INITIALISATION
   ═══════════════════════════════════════════════════════════════════════════ */

function queryDOMElements() {
  elements = {
    // Sidebar
    sidebar: document.querySelector(".sidebar"),
    btnNewChat: document.getElementById("btn-new-chat"),
    historiqueList: document.getElementById("historique-list"),
    roleButtons: document.querySelectorAll(".role-btn-compact"),
    personalityButtons: document.querySelectorAll(".personality-btn-compact"),
    btnConfig: document.getElementById("btn-config"),

    // Chat
    chatMessages: document.getElementById("chat-messages"),
    chatForm: document.getElementById("chat-form"),
    chatInput: document.getElementById("chat-input"),
    btnSend: document.querySelector(".btn-send"),
    chatHeader: document.querySelector(".chat-header"),
    currentRoleDisplay: document.getElementById("current-role-display"),
    currentRoleDesc: document.getElementById("current-role-desc"),
    btnMenuToggle: document.getElementById("btn-menu-toggle"),

    // Modal
    modalConfig: document.getElementById("modal-config"),
    btnCloseModal: document.getElementById("btn-close-modal"),
    inputClaude: document.getElementById("input-claude"),
    inputGemini: document.getElementById("input-gemini"),
    inputApiKey: document.getElementById("input-apikey"),
    btnSaveKeys: document.getElementById("btn-save-keys"),
    btnClearKeys: document.getElementById("btn-clear-keys"),
    configMessage: document.getElementById("config-message"),

    // Indicateur de frappe
    typingIndicator: document.getElementById("typing-indicator"),

    // Suggestion chips
    suggestionChips: document.getElementById("suggestion-chips")
  };
}

function initialize() {
  // Query DOM elements after DOM is ready
  queryDOMElements();

  // Initialiser la première conversation
  if (!state.currentConversationId) {
    const conv = initializeFirstConversation(state.currentRole);
    state.currentConversationId = conv.id;
  }

  setupEventListeners();
  updateRoleDisplay();
  renderHistorique();
  loadConversationMessages();

  // Initialiser les attributs aria pour les accordéons
  initializeAccordionAttributes();
}

/* ═══════════════════════════════════════════════════════════════════════════
   EVENT LISTENERS
   ═══════════════════════════════════════════════════════════════════════════ */

function setupEventListeners() {
  // Chat
  elements.chatForm.addEventListener("submit", handleSendMessage);
  elements.btnMenuToggle.addEventListener("click", toggleSidebar);

  // Rôles
  elements.roleButtons.forEach(btn => {
    btn.addEventListener("click", () => handleRoleChange(btn.dataset.role));
  });

  // Personnalités
  elements.personalityButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const personality = btn.dataset.personality === "none" ? null : btn.dataset.personality;
      handlePersonalityChange(personality);
    });
  });

  // Nouvelle conversation
  elements.btnNewChat.addEventListener("click", handleNewConversation);

  // Configuration
  elements.btnConfig.addEventListener("click", () => openModal());
  elements.btnCloseModal.addEventListener("click", closeModal);
  elements.btnSaveKeys.addEventListener("click", handleSaveApiKeys);
  elements.btnClearKeys.addEventListener("click", handleClearApiKeys);

  // Fermer modal en cliquant sur le fond (backdrop)
  elements.modalConfig.addEventListener("click", e => {
    if (e.target.classList.contains("modal")) closeModal();
  });

  // Accordéons
  setupAccordions();

  // Suggestion chips
  setupSuggestionChips();

  // Bouton suppression historique
  const btnClearHistory = document.getElementById("btn-clear-history");
  if (btnClearHistory) {
    btnClearHistory.addEventListener("click", handleClearAllHistory);
  }

  // Responsive
  window.addEventListener("resize", handleResize);
}

/* ═══════════════════════════════════════════════════════════════════════════
   GESTION DES ACCORDÉONS
   ═══════════════════════════════════════════════════════════════════════════ */

function initializeAccordionAttributes() {
  const accordionHeaders = document.querySelectorAll(".accordion-header");

  accordionHeaders.forEach(header => {
    const contentId = header.id.replace("accordion-", "content-");
    const content = document.getElementById(contentId);
    const isOpen = content && content.classList.contains("open");

    header.setAttribute("aria-expanded", isOpen ? "true" : "false");
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
  });
}

function setupAccordions() {
  const accordionHeaders = document.querySelectorAll(".accordion-header");

  accordionHeaders.forEach(header => {
    header.addEventListener("click", () => {
      toggleAccordion(header);
    });

    // Permettre d'ouvrir avec Entrée
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleAccordion(header);
      }
    });
  });
}

function toggleAccordion(header) {
  const contentId = header.id.replace("accordion-", "content-");
  const content = document.getElementById(contentId);

  if (!content) return;

  // Fermer les autres accordéons (optionnel - décommenter pour un seul ouvert à la fois)
  // document.querySelectorAll(".accordion-content").forEach(c => {
  //   if (c !== content && c.classList.contains("open")) {
  //     c.classList.remove("open");
  //     document.getElementById(c.id.replace("content-", "accordion-")).setAttribute("aria-expanded", "false");
  //   }
  // });

  // Basculer l'accordéon courant
  content.classList.toggle("open");
  const isOpen = content.classList.contains("open");
  header.setAttribute("aria-expanded", isOpen);
}

function handleClearAllHistory() {
  if (!confirm("Êtes-vous sûr de vouloir supprimer tout l'historique? Cette action est irréversible.")) {
    return;
  }

  try {
    // Vider les conversations
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify([]));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION);

    // Réinitialiser l'état
    const newConv = createConversation(state.currentRole, state.currentPersonality);
    saveConversation(newConv);
    state.currentConversationId = newConv.id;
    setCurrentConversationId(newConv.id);

    // Mettre à jour l'interface
    renderHistorique();
    loadConversationMessages();
    elements.chatMessages.innerHTML = '<div class="message-welcome"><div class="welcome-icon">👋</div><h3>Bienvenue!</h3><p id="welcome-text">Sélectionnez un rôle et commencez à discuter</p></div>';

    console.log("✓ Historique supprimé");
  } catch (error) {
    console.error("Erreur lors de la suppression de l'historique:", error);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   GESTION DES MESSAGES
   ═══════════════════════════════════════════════════════════════════════════ */

async function handleSendMessage(e) {
  e.preventDefault();

  const message = elements.chatInput.value.trim();
  if (!message || state.isLoading) return;

  // Limiter à 10000 caractères pour éviter les débordements localStorage
  if (message.length > 10000) {
    alert("Le message dépasse 10000 caractères. Veuillez le raccourcir.");
    return;
  }

  // Hide suggestion chips on first message
  elements.suggestionChips?.classList.add("hidden");

  // Réinitialiser input
  elements.chatInput.value = "";
  elements.chatInput.focus();

  // Ajouter le message utilisateur
  addMessageToUI("user", message);

  // Sauvegarder dans la conversation
  const conversation = getConversationById(state.currentConversationId);
  if (conversation) {
    addMessageToConversation(state.currentConversationId, {
      role: "user",
      content: message
    });

    // Mettre à jour le titre de la conversation si c'est le premier message
    if (conversation.messages.length === 1) {
      const title = message.length > 50 ? message.substring(0, 50) + "..." : message;
      updateConversationTitle(state.currentConversationId, title);
      renderHistorique();
    }
  }

  // Obtenir la réponse
  const lower = message.toLowerCase();
  const typingLabel = /météo|meteo/.test(lower) ? "Récupération météo…" : null;
  showTypingIndicator(typingLabel);
  state.isLoading = true;
  elements.btnSend.disabled = true;

  try {
    const response = await generateResponse(message);
    addMessageToUI("bot", response);
    addMessageToConversation(state.currentConversationId, {
      role: "assistant",
      content: response
    });
  } catch (error) {
    const errorMsg =
      error.message ||
      "Erreur lors de la génération de la réponse. Vérifie tes clés API.";
    addMessageToUI("bot", `❌ ${errorMsg}`);
  } finally {
    hideTypingIndicator();
    state.isLoading = false;
    elements.btnSend.disabled = false;
  }
}

async function generateResponse(userMessage) {
  const isWeather = /météo|meteo|temps qu.il fait/i.test(userMessage);
  const cacheKey = userMessage.trim().toLowerCase().slice(0, 120);

  // 1. Cache hit (skip for weather — time-sensitive)
  if (!isWeather && _responseCache.has(cacheKey)) {
    return _responseCache.get(cacheKey);
  }

  const systemPrompt = combineRoleAndPersonality(state.currentRole, state.currentPersonality);
  const conversation = getConversationById(state.currentConversationId);
  const conversationHistory = (conversation?.messages || [])
    .slice(-20)
    .map(msg => ({ role: msg.role === "user" ? "user" : "assistant", content: msg.content }));

  // 2. Embedded lesson match (instant, no API call)
  const cleaned = cleanQuery(userMessage);
  const lessonResult = findLesson(cleaned || userMessage);
  if (lessonResult) return _cacheAndReturn(cacheKey, lessonResult, isWeather);

  // 3. AI providers (Claude → Gemini)
  const aiType = selectBestAI();
  try {
    let aiResult = null;
    if (aiType === "claude") {
      aiResult = await callClaudeAPI(userMessage, systemPrompt, conversationHistory);
    } else if (aiType === "gemini") {
      aiResult = await callGeminiAPI(userMessage, systemPrompt);
    }
    if (aiResult) return _cacheAndReturn(cacheKey, aiResult, isWeather);
  } catch (err) {
    console.warn("AI error, trying Wikipedia fallback:", err.message);
  }

  // 4. Wikipedia fallback (when AI APIs unavailable or failed)
  try {
    const wikiResult = await searchWikipedia(cleaned || userMessage);
    if (wikiResult) return _cacheAndReturn(cacheKey, wikiResult, isWeather);
  } catch { /* ignore */ }

  // 5. Basic built-in responses
  return generateBasicResponse(userMessage);
}

function _cacheAndReturn(key, result, skipCache) {
  // skipCache=true pour météo (données temps-sensibles), false pour tout le reste
  if (skipCache !== true) {
    if (_responseCache.size >= 60) _responseCache.delete(_responseCache.keys().next().value);
    _responseCache.set(key, result);
  }
  return result;
}

function generateBasicResponse(message) {
  const lower = message.toLowerCase();

  if (
    /bonjour|salut|hey|hello|coucou|bonsoir/.test(lower)
  ) {
    const h = new Date().getHours();
    const period =
      h < 12 ? "matin" : h < 18 ? "après-midi" : "soir";
    return `👋 Bonjour! Bonne ${period}.\n\nJe suis ChatIA, ton assistant intelligent. Pour obtenir les meilleures réponses, configure les clés API (Claude ou Gemini) via ⚙️\n\nQue puis-je faire pour toi?`;
  }

  if (/merci|super|parfait|nickel|bravo|merci/.test(lower)) {
    return "😊 Avec plaisir! Une autre question?";
  }

  if (/au revoir|bye|à bientôt|ciao/.test(lower)) {
    return "👋 À bientôt! Reviens quand tu veux!";
  }

  if (/aide|help/.test(lower)) {
    const role = getRole(state.currentRole);
    return `📚 Rôle actuel: ${role.name}\n\n${role.description}\n\nVous pouvez changer de rôle via la barre latérale pour avoir différents styles de réponse.`;
  }

  if (/heure|quelle heure/.test(lower)) {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `🕐 Il est actuellement ${h}:${m}`;
  }

  if (/date|quel jour|aujourd'hui/.test(lower)) {
    const d = new Date();
    const opts = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    };
    return `📅 ${d.toLocaleDateString("fr-FR", opts)}`;
  }

  // Réponse par défaut
  return `Je ne peux pas répondre correctement sans une clé API.

⚙️ Clique sur le bouton Paramètres pour configurer Claude AI ou Gemini, et tu auras accès à des réponses bien plus complètes!

En attendant, tu peux me poser des questions simples, et je ferai mon mieux avec mes connaissances limitées.`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   AFFICHAGE DES MESSAGES
   ═══════════════════════════════════════════════════════════════════════════ */

function addMessageToUI(role, content) {
  const messageEl = document.createElement("div");
  messageEl.className = `message ${role}`;

  const avatar =
    role === "user"
      ? "👤"
      : getRole(state.currentRole).icon;

  const contentEl = document.createElement("div");
  contentEl.className = "message-content";
  contentEl.textContent = content;

  const avatarEl = document.createElement("div");
  avatarEl.className = "message-avatar";
  avatarEl.textContent = avatar;

  messageEl.appendChild(avatarEl);
  messageEl.appendChild(contentEl);

  elements.chatMessages.appendChild(messageEl);

  // Auto scroll
  setTimeout(() => {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  }, 0);
}

const TYPING_MESSAGES = [
  "💭 Réfléchit intensément…",
  "🔍 Cherche et vérifie…",
  "✨ En train de formuler une réponse…",
  "📊 Analyse en cours…",
  "📚 Consultation des sources…",
  "🧠 Traitement des données…",
  "⚡ Génération de la réponse…",
  "🎯 Synthèse en cours…",
  "💡 Réflexion profonde…",
  "🚀 Préparation de la réponse…"
];

function showTypingIndicator(label) {
  const msg = label || TYPING_MESSAGES[Math.floor(Math.random() * TYPING_MESSAGES.length)];

  const messageEl = document.createElement("div");
  messageEl.className = "message bot";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = getRole(state.currentRole).icon;

  const bubble = document.createElement("div");
  bubble.className = "typing-bubble";
  bubble.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-label">${msg}</span>
  `;

  messageEl.appendChild(avatar);
  messageEl.appendChild(bubble);
  elements.chatMessages.appendChild(messageEl);

  setTimeout(() => {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  }, 0);
}

function setupSuggestionChips() {
  const chips = document.querySelectorAll(".chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      elements.chatInput.value = chip.dataset.query;
      elements.suggestionChips?.classList.add("hidden");
      elements.chatForm.dispatchEvent(new Event("submit"));
    });
  });
}

function hideTypingIndicator() {
  const typingBubble = elements.chatMessages.querySelector(".typing-bubble");
  if (typingBubble) {
    typingBubble.closest(".message").remove();
  }
}

function loadConversationMessages() {
  elements.chatMessages.innerHTML = "";

  const conversation = getConversationById(state.currentConversationId);
  if (!conversation || conversation.messages.length === 0) {
    elements.chatMessages.innerHTML = `
      <div class="message-welcome">
        <div class="welcome-icon">👋</div>
        <h3>Bienvenue!</h3>
        <p>Commence une nouvelle conversation avec le rôle: <strong>${getRole(state.currentRole).name}</strong></p>
      </div>
    `;
    return;
  }

  // Charger les messages existants
  conversation.messages.forEach(msg => {
    addMessageToUI(msg.role === "user" ? "user" : "bot", msg.content);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   GESTION DES RÔLES
   ═══════════════════════════════════════════════════════════════════════════ */

function handleRoleChange(roleKey) {
  state.currentRole = roleKey;
  saveCurrentRole(roleKey);

  // Mettre à jour l'affichage
  updateRoleDisplay();

  // Réinitialiser le chat avec le nouveau rôle
  loadConversationMessages();

  elements.chatInput.focus();
}

function handlePersonalityChange(personalityKey) {
  state.currentPersonality = personalityKey;
  saveCurrentPersonality(personalityKey);

  // Mettre à jour l'affichage
  updateRoleDisplay();

  elements.chatInput.focus();
}

function updateRoleDisplay() {
  const role = getRole(state.currentRole);
  const personality = state.currentPersonality ? getPersonality(state.currentPersonality) : null;

  // Mettre à jour le header
  let displayText = `${role.icon} ${role.name}`;
  let descText = role.description;

  if (personality) {
    displayText += ` • ${personality.icon} ${personality.name}`;
    descText += ` | ${personality.description}`;
  }

  elements.currentRoleDisplay.textContent = displayText;
  elements.currentRoleDesc.textContent = descText;

  // Mettre à jour les boutons de rôle
  elements.roleButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.role === state.currentRole);
  });

  // Mettre à jour les boutons de personnalité
  elements.personalityButtons.forEach(btn => {
    const personality = btn.dataset.personality === "none" ? null : btn.dataset.personality;
    btn.classList.toggle("active", personality === state.currentPersonality);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   GESTION DES CONVERSATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

function handleNewConversation() {
  const newConv = createConversation(state.currentRole, state.currentPersonality);
  saveConversation(newConv);
  state.currentConversationId = newConv.id;
  setCurrentConversationId(newConv.id);

  renderHistorique();
  loadConversationMessages();
  elements.chatInput.focus();
}

function renderHistorique() {
  const history = getConversationHistory();
  elements.historiqueList.innerHTML = "";

  if (history.length === 0) {
    elements.historiqueList.innerHTML =
      '<p style="font-size: 0.875rem; color: var(--text-secondary); text-align: center; padding: 1rem;">Aucune conversation</p>';
    return;
  }

  history.forEach(conv => {
    const container = document.createElement("div");
    container.className = "historique-item-container";

    const item = document.createElement("button");
    item.className = "historique-item";
    if (conv.id === state.currentConversationId) {
      item.classList.add("active");
    }
    item.textContent = conv.title;
    item.onclick = () => selectConversation(conv.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "historique-delete-btn";
    deleteBtn.textContent = "×";
    deleteBtn.title = "Supprimer cette conversation";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      handleDeleteConversation(conv.id);
    };

    container.appendChild(item);
    container.appendChild(deleteBtn);
    elements.historiqueList.appendChild(container);
  });
}

function selectConversation(conversationId) {
  state.currentConversationId = conversationId;
  setCurrentConversationId(conversationId);
  renderHistorique();
  loadConversationMessages();
  elements.chatInput.focus();

  // Fermer la sidebar sur mobile
  if (window.innerWidth <= 768) {
    elements.sidebar.classList.remove("active");
  }
}

function handleDeleteConversation(conversationId) {
  const conversation = getConversationById(conversationId);
  if (!conversation) return;

  const confirmDelete = confirm(
    `Êtes-vous sûr de vouloir supprimer la conversation:\n\n"${conversation.title}"\n\nCette action est irréversible.`
  );

  if (confirmDelete) {
    deleteConversation(conversationId);
    renderHistorique();

    if (state.currentConversationId === conversationId) {
      const remainingConversations = getConversationHistory();
      if (remainingConversations.length > 0) {
        selectConversation(remainingConversations[0].id);
      } else {
        handleNewConversation();
      }
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIGURATION API
   ═══════════════════════════════════════════════════════════════════════════ */

function openModal() {
  const keys = getApiKeys();
  elements.inputClaude.value = keys.claudeKey;
  elements.inputGemini.value = keys.geminiKey;
  elements.inputApiKey.value = keys.searchKey;
  elements.modalConfig.classList.add("active");
}

function closeModal() {
  elements.modalConfig.classList.remove("active");
}

function handleSaveApiKeys() {
  const claudeKey = elements.inputClaude.value.trim();
  const geminiKey = elements.inputGemini.value.trim();
  const searchKey = elements.inputApiKey.value.trim();

  // Validation
  if (!claudeKey && !geminiKey && !searchKey) {
    showConfigMessage(
      "⚠️ Veuillez entrer au moins une clé API",
      "error"
    );
    return;
  }

  if (claudeKey && !claudeKey.startsWith("sk-ant-")) {
    showConfigMessage("⚠️ Clé Claude invalide (doit commencer par sk-ant-)", "error");
    return;
  }

  if (geminiKey && !geminiKey.startsWith("AIza")) {
    showConfigMessage("⚠️ Clé Gemini invalide (doit commencer par AIza)", "error");
    return;
  }

  if (searchKey && !searchKey.startsWith("AIza")) {
    showConfigMessage("⚠️ Clé Search invalide (doit commencer par AIza)", "error");
    return;
  }

  saveApiKeys(claudeKey, geminiKey, searchKey);
  showConfigMessage("✅ Configuration sauvegardée!", "success");

  setTimeout(() => {
    closeModal();
  }, 2500);
}

function handleClearApiKeys() {
  if (confirm("Êtes-vous sûr de vouloir effacer toutes les clés API?")) {
    clearApiKeys();
    elements.inputClaude.value = "";
    elements.inputGemini.value = "";
    elements.inputApiKey.value = "";
    showConfigMessage("🗑️ Clés effacées", "success");
  }
}

function showConfigMessage(message, type) {
  elements.configMessage.textContent = message;
  elements.configMessage.className = `config-message show ${type}`;
  setTimeout(() => {
    elements.configMessage.classList.remove("show");
  }, 3000);
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════════ */

function toggleSidebar() {
  state.sidebar.open = !state.sidebar.open;
  elements.sidebar.classList.toggle("active");
}

function handleResize() {
  if (window.innerWidth > 768) {
    elements.sidebar.classList.remove("active");
    state.sidebar.open = true;
  } else {
    state.sidebar.open = false;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   DÉMARRAGE
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", initialize);
