# Voice Ingredient List Manager

A multilingual, voice-first ingredient planner built for real catering work. Speak an item such as *"2 kg potatoes"* in **English, Hindi or Gujarati**, and it is parsed into a structured ingredient with quantity and unit. Set the number of guests and every quantity scales automatically, then export the list as a print-ready PDF.

---

## Features

- **Voice input in 3 languages:** browser Speech Recognition with `en-US`, `hi-IN` and `gu-IN`
- **Natural-language parsing:** turns phrases like "500 grams tomatoes" into name, quantity and unit
- **Categories and sub-ingredients:** group items (e.g. vegetables, spices) with nested ingredients and duplicate-name checks
- **Automatic scaling:** change the number of people and all quantities recalculate from stored base amounts
- **Multiple lists:** create and switch between lists for different events or menus
- **PDF export** with Gujarati font support, ready to hand to suppliers or kitchen staff
- **Persistence:** works offline with local storage; PostgreSQL schema included for a shared database

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Material UI |
| Speech | Web Speech API (SpeechRecognition) |
| Export | jsPDF, jspdf-autotable, html2canvas, Noto Sans Gujarati |
| Data | localStorage, PostgreSQL (`pg`), SQL schema in `database_setup.sql` |

## Run locally

```bash
git clone https://github.com/Alok-Yadav-21/voice-ingredient-list-manager.git
cd voice-ingredient-list-manager
npm install
npm run dev        # http://localhost:5173
```

Voice input needs a Chromium-based browser (Chrome or Edge) and microphone permission.

**Optional PostgreSQL setup:** run `database_setup.sql` against a new `voice_ingredient_lists` database and set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` and `DB_PASSWORD`. See [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) and [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Project structure

```
src/components/   IngredientList, VoiceInputModal, ScalingControl, ListSelector
src/services/     databaseService (persistence layer)
src/config/       database configuration
src/types.ts      Ingredient, category and list types
```

## Author

**Alok Yadav** · AI/ML Engineer · MSc Data Science, Middlesex University London

[Portfolio](https://mathtodata.com) · [LinkedIn](https://www.linkedin.com/in/yadavalokml) · [GitHub](https://github.com/Alok-Yadav-21)
