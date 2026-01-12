# Unhinged Idioms - Chrome Extension

Learn colorful idioms from around the world every time you open a new tab!

## Features

- 🌍 **44+ Idioms** across 12 languages (Hindi, Spanish, French, German, Korean, Japanese, Mandarin Chinese, Arabic, Russian, Italian, Portuguese, Turkish)
- 🎨 **Clean, minimal UI** inspired by modern design principles
- 🔊 **Audio pronunciation** using Web Speech API
- ⭐ **Save favorites** to review later
- 📖 **Origin stories** for each idiom
- 🎯 **No repeats** until you've seen all idioms
- 💾 **Works offline** - no backend required

## Installation

### Option 1: Load Unpacked (Developer Mode)

1. **Download the extension files**
   - Download all files in this folder

2. **Create icon files** (required)
   - Go to an online tool like [favicon.io](https://favicon.io/favicon-generator/) or [Canva](https://www.canva.com/)
   - Create three PNG icons:
     - `icon16.png` (16x16 pixels)
     - `icon48.png` (48x48 pixels)
     - `icon128.png` (128x128 pixels)
   - Use the 🗣️ emoji or any icon you like with a teal/turquoise background (#2dd4bf)
   - Save these files in the `icons/` folder

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `unhinged-idioms` folder
   - The extension should now appear in your extensions list

4. **Test it**
   - Open a new tab
   - You should see a beautiful idiom card!

### Option 2: Quick Icon Creation

If you don't want to create custom icons, you can:

1. Use a placeholder emoji converter:
   - Go to [Emoji to PNG](https://emoji.aranja.com/)
   - Convert 🗣️ emoji to PNG
   - Download and resize to 16px, 48px, and 128px

2. Or use any simple icon:
   - Any square PNG image will work
   - Just name them correctly and put in the `icons/` folder

## File Structure

```
unhinged-idioms/
├── manifest.json          # Extension configuration
├── newtab.html           # Main HTML structure
├── styles.css            # All styling
├── newtab.js             # Core functionality
├── idioms.json           # Idiom database (44 idioms)
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

### Features
- **Auto-advance**: Each new tab shows a different idiom
- **No repeats**: Won't repeat idioms until you've seen them all
- **Pronunciation**: Click "Play pronunciation" to hear the idiom
- **Favorites**: Save idioms you love and review them anytime

## Customization

### Adding More Idioms

To add more idioms, edit `idioms.json` and follow this format:

```json
{
  "id": "unique-id",
  "languageCode": "es-ES",
  "languageName": "Spanish",
  "idiom": "Idiom text in original language",
  "meaningEn": "English translation/meaning",
  "exampleNative": "Example sentence in original language",
  "exampleEn": "Example sentence in English",
  "transliteration": "Optional romanization",
  "origin": "Optional origin story"
}
```

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
- **Permissions**: `storage` (for saving favorites and progress)
- **Browser Support**: Chrome, Edge, Brave (any Chromium-based browser)
- **Storage**: Uses `chrome.storage.local` for persistence
- **Audio**: Web Speech Synthesis API (built into browser)

## Troubleshooting

### Extension doesn't load
- Make sure all files are in the correct locations
- Check that icon files exist in the `icons/` folder
- Try reloading the extension in `chrome://extensions/`

### Audio doesn't work
- Speech synthesis requires internet connection on first load
- Some languages may not have voices available
- Check browser console for errors

### Idioms not showing
- Check browser console (F12) for errors
- Verify `idioms.json` is valid JSON
- Clear extension storage: Go to `chrome://extensions/` > Details > Clear storage

## Credits

Created with ❤️ for language lovers and idiom enthusiasts worldwide.

**Tagline**: Everyday idioms in a new language

## License

Free to use and modify. Share the love of languages!

---

Enjoy discovering unhinged idioms from around the world! 🌍🗣️
