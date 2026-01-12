// newtab.js
let allIdioms = [];
let queue = [];
let seenIds = new Set();
let currentIdiom = null;
let savedIdioms = new Set();

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadIdioms();
  await loadState();
  await showNextIdiom();
  setupEventListeners();
});

async function loadIdioms() {
  try {
    const response = await fetch('idioms.json');
    allIdioms = await response.json();
  } catch (error) {
    console.error('Failed to load idioms:', error);
    allIdioms = [];
  }
}

async function loadState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['seenIds', 'queue', 'savedIdioms'], (result) => {
      seenIds = new Set(result.seenIds || []);
      queue = result.queue || [];
      savedIdioms = new Set(result.savedIdioms || []);
      resolve();
    });
  });
}

async function saveState() {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      seenIds: Array.from(seenIds),
      queue: queue,
      savedIdioms: Array.from(savedIdioms)
    }, resolve);
  });
}

function shuffleQueue() {
  const unseenIdioms = allIdioms.filter(idiom => !seenIds.has(idiom.id));
  
  if (unseenIdioms.length === 0) {
    seenIds.clear();
    queue = [...allIdioms];
  } else {
    queue = [...unseenIdioms];
  }
  
  // Fisher-Yates shuffle
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
}

async function showNextIdiom() {
  if (queue.length === 0) {
    shuffleQueue();
  }
  
  if (queue.length === 0) {
    showToast('No idioms available');
    return;
  }
  
  const card = document.getElementById('idiomCard');
  const loadingCard = document.getElementById('loadingCard');
  
  card.classList.add('fade-out');
  
  await new Promise(resolve => setTimeout(resolve, 150));
  
  card.style.display = 'none';
  loadingCard.classList.remove('hidden');
  
  currentIdiom = queue.shift();
  seenIds.add(currentIdiom.id);
  await saveState();
  
  renderIdiom(currentIdiom);
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  loadingCard.classList.add('hidden');
  card.style.display = 'block';
  
  // Small delay for smooth appearance
  setTimeout(() => {
    card.classList.remove('fade-out');
  }, 50);
}

function renderIdiom(idiom) {
  document.getElementById('languageBadge').textContent = idiom.languageName;
  document.getElementById('idiomText').textContent = idiom.idiom;
  document.getElementById('transliteration').textContent = idiom.transliteration || '';
  document.getElementById('meaningText').textContent = idiom.meaningEn;
  document.getElementById('exampleNative').textContent = idiom.exampleNative;
  document.getElementById('exampleEnglish').textContent = idiom.exampleEn;
  
  const originBox = document.getElementById('originBox');
  const originText = document.getElementById('originText');
  if (idiom.origin) {
    originText.textContent = idiom.origin;
    originBox.style.display = 'block';
  } else {
    originBox.style.display = 'none';
  }
  
  const favoriteBtn = document.getElementById('favoriteBtn');
  if (savedIdioms.has(idiom.id)) {
    favoriteBtn.classList.add('active');
  } else {
    favoriteBtn.classList.remove('active');
  }
}

async function playAudio() {
  if (!currentIdiom) return;
  
  try {
    const utterance = new SpeechSynthesisUtterance(currentIdiom.idiom);
    
    const voices = speechSynthesis.getVoices();
    const targetLang = currentIdiom.languageCode.split('-')[0];
    
    let matchedVoice = voices.find(voice => voice.lang.startsWith(targetLang));
    
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = currentIdiom.languageCode;
    } else if (currentIdiom.transliteration) {
      utterance.text = currentIdiom.transliteration;
    }
    
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
    showToast('Playing...');
  } catch (error) {
    console.error('Speech synthesis error:', error);
    showToast('Speech not available');
  }
}

async function toggleFavorite() {
  if (!currentIdiom) return;
  
  const favoriteBtn = document.getElementById('favoriteBtn');
  
  if (savedIdioms.has(currentIdiom.id)) {
    savedIdioms.delete(currentIdiom.id);
    favoriteBtn.classList.remove('active');
    showToast('Removed from saved');
  } else {
    savedIdioms.add(currentIdiom.id);
    favoriteBtn.classList.add('active');
    showToast('Saved!');
  }
  
  await saveState();
}

function showSavedPanel() {
  const panel = document.getElementById('savedPanel');
  const list = document.getElementById('savedList');
  
  list.innerHTML = '';
  
  if (savedIdioms.size === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <p>No saved idioms yet.<br>Click the bookmark icon to save your favorites!</p>
      </div>
    `;
  } else {
    const saved = allIdioms.filter(idiom => savedIdioms.has(idiom.id));
    saved.forEach(idiom => {
      const item = document.createElement('div');
      item.className = 'saved-item';
      item.innerHTML = `
        <div class="saved-item-header">
          <div>
            <div class="saved-item-idiom">${idiom.idiom}</div>
            <div class="saved-item-language">${idiom.languageName}</div>
          </div>
          <button class="remove-saved-btn" data-id="${idiom.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="saved-item-meaning">${idiom.meaningEn}</div>
      `;
      
      item.querySelector('.remove-saved-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        savedIdioms.delete(idiom.id);
        await saveState();
        showSavedPanel();
        showToast('Removed from saved');
      });
      
      item.addEventListener('click', () => {
        currentIdiom = idiom;
        renderIdiom(idiom);
        panel.classList.add('hidden');
      });
      
      list.appendChild(item);
    });
  }
  
  panel.classList.remove('hidden');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2000);
}

function setupEventListeners() {
  document.getElementById('shuffleBtn').addEventListener('click', showNextIdiom);
  document.getElementById('playBtn').addEventListener('click', playAudio);
  document.getElementById('favoriteBtn').addEventListener('click', toggleFavorite);
  
  document.getElementById('savedBtn').addEventListener('click', showSavedPanel);
  document.getElementById('closeSavedBtn').addEventListener('click', () => {
    document.getElementById('savedPanel').classList.add('hidden');
  });
  
  // Load voices
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      speechSynthesis.getVoices();
    };
  }
}
