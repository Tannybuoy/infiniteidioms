// options.js

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

async function loadSettings() {
  const result = await chrome.storage.local.get(['geminiApiKey']);
  if (result.geminiApiKey) {
    document.getElementById('apiKey').value = result.geminiApiKey;
  }
}

function setupEventListeners() {
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('testBtn').addEventListener('click', testConnection);
  document.getElementById('clearCacheBtn').addEventListener('click', clearCache);
  document.getElementById('toggleVisibility').addEventListener('click', togglePasswordVisibility);
}

async function saveSettings() {
  const apiKey = document.getElementById('apiKey').value.trim();

  if (!apiKey) {
    showStatus('Please enter an API key', 'error');
    return;
  }

  await chrome.storage.local.set({ geminiApiKey: apiKey });
  showStatus('Settings saved successfully!', 'success');
}

async function testConnection() {
  const apiKey = document.getElementById('apiKey').value.trim();

  if (!apiKey) {
    showStatus('Please enter an API key first', 'error');
    return;
  }

  showStatus('Testing connection...', 'success');

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say "Connection successful!" in exactly those words.'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 20
        }
      })
    });

    if (response.ok) {
      showStatus('Connection successful! Your API key is working.', 'success');
    } else {
      const error = await response.json();
      showStatus(`Connection failed: ${error.error?.message || 'Invalid API key'}`, 'error');
    }
  } catch (error) {
    showStatus(`Connection failed: ${error.message}`, 'error');
  }
}

async function clearCache() {
  await chrome.storage.local.remove(['idiomCache', 'seenIds', 'queue']);
  showStatus('Cache cleared! You\'ll see fresh idioms now.', 'success');
}

function togglePasswordVisibility() {
  const input = document.getElementById('apiKey');
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
}
