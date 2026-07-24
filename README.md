# Verbum

Project Verbum - a local Latin flashcard app.

Latin on the front, English on the back. The app currently ships with the
**Nouns** category; Verbs, Adjectives, Prepositions, and Other are stubbed
in the UI and will be filled in later.

## Running locally

```bash
npm install
npm run dev
```

Then open the printed `http://localhost:5173` URL in a browser.

`npm run build && npm run preview` builds and serves the production bundle.

## Card format

Each noun card shows **Nominative / Genitive / Declension / Gender** on the
front (e.g. `Pater / Patris / 3rd / Male`), with the non-stem part of the
genitive bolded for emphasis. The back shows the English translation.

## Data storage

Flashcards live in plain JSON under `public/data/`, one file per category
(`nouns.json`, and later `verbs.json`, `adjectives.json`, etc.). This was
chosen over a CSV/text file, a Latin dictionary API, or a local database:
JSON is easy to hand-edit, supports the structured fields the app needs
(like splitting the genitive into `stem`/`ending` so only the ending gets
bolded), needs no server, and — being plain files rather than anything
React/Vite-specific — can be read directly by a future terminal/CLI version
of this app.

To add a noun, append an entry to `public/data/nouns.json`:

```json
{
  "id": "noun-example",
  "partOfSpeech": "noun",
  "nominative": "Insula",
  "genitive": { "stem": "Insul", "ending": "ae" },
  "declension": 1,
  "gender": "Female",
  "english": "island"
}
```

To add a new category later: create `public/data/<category>.json`, add the
matching card type to `src/types/flashcard.ts`, add a render case in
`src/components/Flashcard/Flashcard.tsx`, and flip `enabled: true` for that
category in `src/data/categories.ts`.

## Background image

The app looks for a background photo at `public/images/roman-forum.jpg` and
falls back to a plain gradient if it isn't present (see `src/index.css`).
Drop a free-license Roman Forum photo at that exact path (e.g. from
[Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Forum_Romanum)
or [Unsplash](https://unsplash.com/s/photos/roman-forum)) and it will appear
automatically — no code changes needed. This wasn't fetched automatically
because this session's network access doesn't reach image-hosting sites.
