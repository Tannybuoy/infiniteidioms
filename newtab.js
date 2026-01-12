// newtab.js - Infinite Idioms with Google Gemini API

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SUPPORTED_LANGUAGES = [
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'zh-CN', name: 'Mandarin Chinese' },
  { code: 'ar-SA', name: 'Arabic' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese' },
  { code: 'tr-TR', name: 'Turkish' },
  { code: 'nl-NL', name: 'Dutch' },
  { code: 'pl-PL', name: 'Polish' },
  { code: 'sv-SE', name: 'Swedish' },
  { code: 'vi-VN', name: 'Vietnamese' },
  { code: 'th-TH', name: 'Thai' },
  { code: 'el-GR', name: 'Greek' },
  { code: 'he-IL', name: 'Hebrew' },
  { code: 'id-ID', name: 'Indonesian' },
  { code: 'ms-MY', name: 'Malay' },
  { code: 'fil-PH', name: 'Filipino' },
  { code: 'uk-UA', name: 'Ukrainian' },
  { code: 'cs-CZ', name: 'Czech' },
  { code: 'ro-RO', name: 'Romanian' },
  { code: 'hu-HU', name: 'Hungarian' },
  { code: 'fi-FI', name: 'Finnish' },
  { code: 'da-DK', name: 'Danish' },
  { code: 'no-NO', name: 'Norwegian' },
  { code: 'bn-BD', name: 'Bengali' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'mr-IN', name: 'Marathi' },
  { code: 'gu-IN', name: 'Gujarati' },
  { code: 'pa-IN', name: 'Punjabi' },
  { code: 'sw-KE', name: 'Swahili' },
  { code: 'fa-IR', name: 'Persian' },
  { code: 'ur-PK', name: 'Urdu' }
];

let idiomCache = [];
let currentIdiom = null;
let savedIdioms = new Set();
let savedIdiomsData = {};
let apiKey = null;
let isLoading = false;
let seenIdiomHashes = new Set();

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadState();
  await checkApiKey();
  setupEventListeners();
});

async function loadState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['savedIdioms', 'savedIdiomsData', 'geminiApiKey', 'idiomCache', 'seenIdiomHashes'], (result) => {
      savedIdioms = new Set(result.savedIdioms || []);
      savedIdiomsData = result.savedIdiomsData || {};
      apiKey = result.geminiApiKey || null;
      idiomCache = result.idiomCache || [];
      seenIdiomHashes = new Set(result.seenIdiomHashes || []);
      resolve();
    });
  });
}

async function saveState() {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      savedIdioms: Array.from(savedIdioms),
      savedIdiomsData: savedIdiomsData,
      idiomCache: idiomCache,
      seenIdiomHashes: Array.from(seenIdiomHashes)
    }, resolve);
  });
}

async function checkApiKey() {
  const setupPrompt = document.getElementById('setupPrompt');
  const idiomCard = document.getElementById('idiomCard');
  const loadingCard = document.getElementById('loadingCard');

  if (!apiKey) {
    setupPrompt.classList.remove('hidden');
    idiomCard.style.display = 'none';
    loadingCard.classList.add('hidden');
  } else {
    setupPrompt.classList.add('hidden');
    await showNextIdiom();
  }
}

function generateIdiomHash(idiom) {
  return `${idiom.languageCode}-${idiom.idiom}`.toLowerCase().replace(/\s+/g, '');
}

async function fetchNewIdiom() {
  if (!apiKey) {
    showToast('Please configure your API key in settings');
    return null;
  }

  const randomLang = SUPPORTED_LANGUAGES[Math.floor(Math.random() * SUPPORTED_LANGUAGES.length)];

  const prompt = `Generate a unique and interesting idiom from ${randomLang.name} language.

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just pure JSON):
{
  "id": "unique-lowercase-id-with-dashes",
  "languageCode": "${randomLang.code}",
  "languageName": "${randomLang.name}",
  "idiom": "the idiom in its native script/alphabet",
  "meaningEn": "the meaning in English (what it actually means, not literal translation)",
  "exampleNative": "an example sentence using this idiom in ${randomLang.name}",
  "exampleEn": "English translation of the example sentence",
  "transliteration": "romanized pronunciation for non-Latin scripts (or null if already Latin)",
  "origin": "brief cultural or historical origin of this idiom (1-2 sentences)"
}

Requirements:
- Choose a real, commonly used idiom in ${randomLang.name}
- The idiom should be interesting, colorful, or culturally significant
- Avoid very common idioms that are similar in English
- Make sure the transliteration is accurate for pronunciation
- The origin should be authentic and informative`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401 || response.status === 403) {
        showToast('Invalid API key. Please check settings.');
      } else {
        showToast(`API error: ${error.error?.message || 'Unknown error'}`);
      }
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      showToast('No response from API');
      return null;
    }

    // Parse the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse idiom JSON:', text);
      showToast('Failed to parse idiom');
      return null;
    }

    const idiom = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!idiom.idiom || !idiom.meaningEn || !idiom.languageCode) {
      showToast('Invalid idiom data received');
      return null;
    }

    // Generate a unique ID if not provided
    if (!idiom.id) {
      idiom.id = `${idiom.languageCode}-${Date.now()}`;
    }

    return idiom;
  } catch (error) {
    console.error('Error fetching idiom:', error);
    showToast('Failed to fetch idiom. Check your connection.');
    return null;
  }
}

async function getNextIdiom() {
  // First check cache for unseen idioms
  const unseenFromCache = idiomCache.filter(idiom => !seenIdiomHashes.has(generateIdiomHash(idiom)));

  if (unseenFromCache.length > 0) {
    const randomIndex = Math.floor(Math.random() * unseenFromCache.length);
    return unseenFromCache[randomIndex];
  }

  // If all cached idioms have been seen, reset the seen hashes and fetch new
  if (idiomCache.length > 0 && seenIdiomHashes.size >= idiomCache.length) {
    seenIdiomHashes.clear();
  }

  // Fetch a new idiom from the API
  const newIdiom = await fetchNewIdiom();

  if (newIdiom) {
    // Add to cache (keep cache size reasonable)
    idiomCache.push(newIdiom);
    if (idiomCache.length > 100) {
      idiomCache = idiomCache.slice(-100);
    }
    await saveState();
  }

  return newIdiom;
}

async function showNextIdiom() {
  if (isLoading) return;
  isLoading = true;

  const card = document.getElementById('idiomCard');
  const loadingCard = document.getElementById('loadingCard');
  const setupPrompt = document.getElementById('setupPrompt');

  // Hide setup prompt if showing
  setupPrompt.classList.add('hidden');

  // Fade out current card
  card.classList.add('fade-out');

  await new Promise(resolve => setTimeout(resolve, 150));

  card.style.display = 'none';
  loadingCard.classList.remove('hidden');

  const idiom = await getNextIdiom();

  if (!idiom) {
    loadingCard.classList.add('hidden');
    card.style.display = 'block';
    card.classList.remove('fade-out');
    isLoading = false;
    return;
  }

  currentIdiom = idiom;
  seenIdiomHashes.add(generateIdiomHash(idiom));
  await saveState();

  renderIdiom(currentIdiom);

  await new Promise(resolve => setTimeout(resolve, 200));

  loadingCard.classList.add('hidden');
  card.style.display = 'block';

  // Small delay for smooth appearance
  setTimeout(() => {
    card.classList.remove('fade-out');
  }, 50);

  isLoading = false;
}

function renderIdiom(idiom) {
  document.getElementById('languageBadge').textContent = idiom.languageName;
  document.getElementById('idiomText').textContent = idiom.idiom;
  document.getElementById('transliteration').textContent = idiom.transliteration || '';
  document.getElementById('meaningText').textContent = idiom.meaningEn;
  document.getElementById('exampleNative').textContent = idiom.exampleNative || '';
  document.getElementById('exampleEnglish').textContent = idiom.exampleEn || '';

  const originBox = document.getElementById('originBox');
  const originText = document.getElementById('originText');
  if (idiom.origin) {
    originText.textContent = idiom.origin;
    originBox.style.display = 'block';
  } else {
    originBox.style.display = 'none';
  }

  const favoriteBtn = document.getElementById('favoriteBtn');
  const idiomHash = generateIdiomHash(idiom);
  if (savedIdioms.has(idiomHash)) {
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
  const idiomHash = generateIdiomHash(currentIdiom);

  if (savedIdioms.has(idiomHash)) {
    savedIdioms.delete(idiomHash);
    delete savedIdiomsData[idiomHash];
    favoriteBtn.classList.remove('active');
    showToast('Removed from saved');
  } else {
    savedIdioms.add(idiomHash);
    savedIdiomsData[idiomHash] = currentIdiom;
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
        <div class="empty-state-icon">&#x221E;</div>
        <p>No saved idioms yet.<br>Click the star icon to save your favorites!</p>
      </div>
    `;
  } else {
    const savedArray = Array.from(savedIdioms);
    savedArray.forEach(hash => {
      const idiom = savedIdiomsData[hash];
      if (!idiom) return;

      const item = document.createElement('div');
      item.className = 'saved-item';
      item.innerHTML = `
        <div class="saved-item-header">
          <div>
            <div class="saved-item-idiom">${idiom.idiom}</div>
            <div class="saved-item-language">${idiom.languageName}</div>
          </div>
          <button class="remove-saved-btn" data-hash="${hash}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="saved-item-meaning">${idiom.meaningEn}</div>
      `;

      item.querySelector('.remove-saved-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        savedIdioms.delete(hash);
        delete savedIdiomsData[hash];
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

function openSettings() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
}

function setupEventListeners() {
  document.getElementById('shuffleBtn').addEventListener('click', showNextIdiom);
  document.getElementById('playBtn').addEventListener('click', playAudio);
  document.getElementById('favoriteBtn').addEventListener('click', toggleFavorite);
  document.getElementById('settingsBtn').addEventListener('click', openSettings);

  const openSettingsBtn = document.getElementById('openSettingsBtn');
  if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', openSettings);
  }

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

  // Listen for storage changes (API key updates from options page)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.geminiApiKey) {
      apiKey = changes.geminiApiKey.newValue;
      if (apiKey && !currentIdiom) {
        checkApiKey();
      }
    }
  });
}
