# Infinite Idioms - Chrome Extension

Discover endless idioms from languages around the world every time you open a new tab! Powered by Google Gemini AI for truly unlimited content.

## Features

- **Unlimited Idioms** - AI-generated idioms from 38+ languages
- **38 Languages Supported** - Including Hindi, Spanish, French, German, Korean, Japanese, Mandarin Chinese, Arabic, Russian, Italian, Portuguese, Turkish, Dutch, Polish, Swedish, Vietnamese, Thai, Greek, Hebrew, Indonesian, and many more
- **Clean, minimal UI** - Inspired by modern design principles
- **Audio pronunciation** - Using Web Speech API
- **Save favorites** - Review your favorite idioms later
- **Origin stories** - Learn the cultural background of each idiom
- **Smart caching** - Idioms are cached locally to reduce API calls
- **No repeats** - Won't repeat idioms until you've seen them all

## Prerequisites

This extension requires a **free Google Gemini API key** to generate idioms.

### Getting Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key for use in the extension

The free tier includes 60 requests per minute, which is more than enough for casual use.

## Installation

### Load Unpacked (Developer Mode)

1. **Download the extension files**
   - Download all files in this repository

2. **Create icon files** (required)
   - Go to [favicon.io](https://favicon.io/favicon-generator/) or [Canva](https://www.canva.com/)
   - Create three PNG icons:
     - `icon16.png` (16x16 pixels)
     - `icon48.png` (48x48 pixels)
     - `icon128.png` (128x128 pixels)
   - Save these files in the `icons/` folder

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extension folder
   - The extension should now appear in your extensions list

4. **Configure API Key**
   - Click the extension icon and select "Options" (or right-click > Options)
   - Enter your Google Gemini API key
   - Click "Save Settings"
   - Test the connection to verify it works

5. **Start Learning!**
   - Open a new tab
   - You should see a beautiful idiom card!

## File Structure

```
infinite-idioms/
├── manifest.json          # Extension configuration
├── newtab.html           # Main HTML structure
├── styles.css            # All styling
├── newtab.js             # Core functionality with Gemini API
├── options.html          # Settings page
├── options.js            # Settings logic
├── icons/
│   ├── icon16.png        # Small icon (YOU NEED TO ADD THIS)
│   ├── icon48.png        # Medium icon (YOU NEED TO ADD THIS)
│   └── icon128.png       # Large icon (YOU NEED TO ADD THIS)
└── README.md             # This file
```

## Usage

### Basic Navigation
- **Shuffle button** (↻): Get a new random idiom
- **Star button** (⭐): Save the current idiom to favorites
- **Bookmark button** (🔖): View all saved idioms
- **Settings button** (⚙️): Configure API key and clear cache

### Features
- **Auto-advance**: Each new tab shows a different idiom
- **No repeats**: Won't repeat idioms until you've seen cached idioms
- **Pronunciation**: Click "Play pronunciation" to hear the idiom
- **Favorites**: Save idioms you love and review them anytime
- **Caching**: Idioms are cached locally (up to 100) to minimize API calls

## Settings

Access settings by clicking the gear icon or right-clicking the extension.

### API Key
Enter your Google Gemini API key to enable idiom generation.

### Clear Cache
Clear the cached idioms to fetch fresh content from the API.

## Customization

### Changing Colors

Edit `styles.css` and modify the CSS variables at the top:

```css
:root {
  --primary: #2dd4bf;        /* Main color (teal)  */
  --primary-dark: #14b8a6;   /* Darker shade */
  --text-primary: #0f172a;   /* Main text color */
  /* ... more variables */
}
```

## Technical Details

- **Manifest Version**: V3 (latest Chrome extension standard)
- **Permissions**: `storage` (for saving favorites and cache)
- **Host Permissions**: `generativelanguage.googleapis.com` (for Gemini API)
- **Browser Support**: Chrome, Edge, Brave (any Chromium-based browser)
- **Storage**: Uses `chrome.storage.local` for persistence
- **Audio**: Web Speech Synthesis API (built into browser)
- **AI Model**: Google Gemini 2.0 Flash

## Troubleshooting

### "Please configure your API key"
- Open extension settings and enter your Gemini API key
- Make sure the key is valid by clicking "Test Connection"

### API errors
- Check that your API key is correct
- Verify you haven't exceeded the rate limit (60 requests/minute)
- Check your internet connection

### Extension doesn't load
- Make sure all files are in the correct locations
- Check that icon files exist in the `icons/` folder
- Try reloading the extension in `chrome://extensions/`

### Audio doesn't work
- Speech synthesis requires internet connection on first load
- Some languages may not have voices available
- Check browser console for errors

## Privacy

- Your API key is stored locally in your browser and is never sent anywhere except Google's API
- Idiom cache is stored locally in your browser
- No analytics or tracking

## Credits

Created with love for language lovers and idiom enthusiasts worldwide.

**Tagline**: Endless idioms from languages around the world

## License

MIT License - Free to use and modify. Share the love of languages!

---

Enjoy discovering infinite idioms from around the world!
