/* ═══════════════════════════════════════════════════════════════════════════
   GESTION DU STOCKAGE LOCAL — localStorage
   ═══════════════════════════════════════════════════════════════════════════ */

const STORAGE_KEYS = {
  CLAUDE_KEY: "chatbot_claude_key",
  GEMINI_KEY: "chatbot_gemini_key",
  SEARCH_KEY: "chatbot_search_key",
  CURRENT_ROLE: "chatbot_current_role",
  CURRENT_PERSONALITY: "chatbot_current_personality",
  CONVERSATIONS: "chatbot_conversations",
  CURRENT_CONVERSATION: "chatbot_current_conversation"
};

/* ─── API KEYS ─── */

function saveApiKeys(claudeKey, geminiKey, searchKey) {
  if (claudeKey) localStorage.setItem(STORAGE_KEYS.CLAUDE_KEY, claudeKey);
  if (geminiKey) localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, geminiKey);
  if (searchKey) localStorage.setItem(STORAGE_KEYS.SEARCH_KEY, searchKey);
}

function getApiKeys() {
  return {
    claudeKey: localStorage.getItem(STORAGE_KEYS.CLAUDE_KEY) || "",
    geminiKey: localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || "",
    searchKey: localStorage.getItem(STORAGE_KEYS.SEARCH_KEY) || ""
  };
}

function clearApiKeys() {
  Object.values(STORAGE_KEYS).forEach(key => {
    if (key.includes("_key")) {
      localStorage.removeItem(key);
    }
  });
}

/* ─── RÔLE ACTIF ─── */

function saveCurrentRole(roleKey) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, roleKey);
}

function getCurrentRole() {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) || "professeur";
}

/* ─── PERSONNALITÉ ACTIVE ─── */

function saveCurrentPersonality(personalityKey) {
  if (personalityKey) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PERSONALITY, personalityKey);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PERSONALITY);
  }
}

function getCurrentPersonality() {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_PERSONALITY) || null;
}

/* ─── CONVERSATIONS & HISTORIQUE ─── */

function generateConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createConversation(roleKey, personalityKey = null) {
  return {
    id: generateConversationId(),
    role: roleKey,
    personality: personalityKey || null,
    title: `Conversation ${new Date().toLocaleDateString("fr-FR")}`,
    createdAt: Date.now(),
    messages: [],
    updatedAt: Date.now()
  };
}

function getConversations() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveConversations(conversations) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  } catch (e) {
    console.warn("Impossible de sauvegarder les conversations", e);
  }
}

function getCurrentConversationId() {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
}

function setCurrentConversationId(conversationId) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, conversationId);
}

function getConversationById(id) {
  const conversations = getConversations();
  return conversations.find(conv => conv.id === id);
}

function saveConversation(conversation) {
  const conversations = getConversations();
  const index = conversations.findIndex(c => c.id === conversation.id);

  if (index >= 0) {
    conversations[index] = {
      ...conversations[index],
      ...conversation,
      updatedAt: Date.now()
    };
  } else {
    conversations.push(conversation);
  }

  saveConversations(conversations);
}

function deleteConversation(id) {
  const conversations = getConversations().filter(c => c.id !== id);
  saveConversations(conversations);

  // Si on supprime la conversation actuelle, passer à une autre
  if (getCurrentConversationId() === id) {
    if (conversations.length > 0) {
      setCurrentConversationId(conversations[0].id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION);
    }
  }
}

function updateConversationTitle(id, title) {
  const conversation = getConversationById(id);
  if (conversation) {
    conversation.title = title;
    saveConversation(conversation);
  }
}

function addMessageToConversation(conversationId, message) {
  const conversation = getConversationById(conversationId);
  if (conversation) {
    conversation.messages.push({
      ...message,
      timestamp: Date.now()
    });
    saveConversation(conversation);
  }
}

function initializeFirstConversation(roleKey) {
  const conversations = getConversations();

  // S'il n'y a pas de conversation, en créer une
  if (conversations.length === 0) {
    const newConv = createConversation(roleKey);
    saveConversation(newConv);
    setCurrentConversationId(newConv.id);
    return newConv;
  }

  // Sinon, utiliser la première
  const firstConv = conversations[0];
  setCurrentConversationId(firstConv.id);
  return firstConv;
}

/* ─── HISTORIQUE POUR LA SIDEBAR ─── */

function getConversationHistory() {
  const conversations = getConversations();
  return conversations
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 20) // Limiter à 20 dernières conversations
    .map(conv => ({
      id: conv.id,
      title: conv.title,
      role: conv.role,
      updatedAt: conv.updatedAt
    }));
}
