/* ═══════════════════════════════════════════════════════════════════════════
   HOME PAGE INTERACTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const modal = document.getElementById('modal-config-home');
const btnSettings = document.getElementById('btn-settings-home');
const btnClose = document.getElementById('btn-close-modal-home');
const btnSaveKeys = document.getElementById('btn-save-keys-home');
const btnClearKeys = document.getElementById('btn-clear-keys-home');
const configMessage = document.getElementById('config-message-home');

// Ouvrir le modal de configuration
btnSettings.addEventListener('click', () => {
  modal.classList.add('visible');
  loadSavedKeys();
});

// Fermer le modal
btnClose.addEventListener('click', () => {
  modal.classList.remove('visible');
});

// Fermer en cliquant en dehors
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('visible');
  }
});

// Charger les clés sauvegardées
function loadSavedKeys() {
  const claude = localStorage.getItem('claude_api_key') || '';
  const gemini = localStorage.getItem('gemini_api_key') || '';
  const apikey = localStorage.getItem('api_key') || '';

  document.getElementById('input-claude-home').value = claude;
  document.getElementById('input-gemini-home').value = gemini;
  document.getElementById('input-apikey-home').value = apikey;
}

// Sauvegarder les clés
btnSaveKeys.addEventListener('click', () => {
  const claude = document.getElementById('input-claude-home').value.trim();
  const gemini = document.getElementById('input-gemini-home').value.trim();
  const apikey = document.getElementById('input-apikey-home').value.trim();

  if (claude) localStorage.setItem('claude_api_key', claude);
  if (gemini) localStorage.setItem('gemini_api_key', gemini);
  if (apikey) localStorage.setItem('api_key', apikey);

  showMessage('✓ Clés enregistrées avec succès!', 'success');
  setTimeout(() => {
    modal.classList.remove('visible');
  }, 1500);
});

// Effacer les clés
btnClearKeys.addEventListener('click', () => {
  if (confirm('Êtes-vous sûr de vouloir effacer toutes les clés?')) {
    localStorage.removeItem('claude_api_key');
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('api_key');

    document.getElementById('input-claude-home').value = '';
    document.getElementById('input-gemini-home').value = '';
    document.getElementById('input-apikey-home').value = '';

    showMessage('✓ Clés effacées', 'success');
  }
});

// Afficher un message de configuration
function showMessage(text, type) {
  configMessage.textContent = text;
  configMessage.className = `config-message ${type}`;
  configMessage.style.display = 'block';

  if (type === 'success') {
    setTimeout(() => {
      configMessage.style.display = 'none';
    }, 3000);
  }
}

// Charger les clés au chargement
window.addEventListener('load', loadSavedKeys);
