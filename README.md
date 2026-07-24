# Verbum

Project Verbum - a local Latin flashcard app.

Latin on the front, English on the back. The app currently ships with
**Nouns** and **Adjectives**; Verbs, Prepositions, and Other are stubbed
in the UI and will be filled in later.

## Running locally

```bash
npm install
npm run dev
```

Then open the printed `http://localhost:5173` URL in a browser.

`npm run build && npm run preview` builds and serves the production bundle.

### Terminal version

A plain-Node CLI reads the same `public/data/*.json` files (no build step,
no dependencies):

```bash
npm run cli
```

Pick a deck, then press Enter to reveal the English translation, `n`/`p`
to move next/prev, `s` to shuffle, `q` to quit.

## Card format

Nouns, and 3rd-declension adjectives (fortis, felix, ...), show
**Nominative / Genitive / Declension / Gender** (e.g. `Pater / Patris /
3rd / Male`), with the non-stem part of the genitive bolded for emphasis.

1st/2nd-declension adjectives (bonus, magnus, ...) don't decline that way —
they have distinct masculine/feminine/neuter forms — so they instead show
**Masculine / Feminine / Neuter** (e.g. `Bonus / Bona / Bonum (1st/2nd
decl.)`).

Either way, the back shows the English translation.

## Vocabulary Tags

Every card can optionally carry `tags: string[]` — thematic labels (e.g.
`family`, `military`) independent of part-of-speech, for pulling
category-based vocabulary sets that cut across nouns/adjectives/etc. later:

```json
"tags": ["family", "military"]
```

Tags are assigned on demand by asking Claude to tag a batch of words —
there's no runtime tagging logic in the app itself, to keep it static and
dependency-free.

**Canonical tag list** (empty until words are tagged): before adding a new
tag, check this list first and reuse an existing one if it fits, to avoid
near-duplicates like `war` / `military` / `battle` meaning the same thing.
New tags get added here as they're introduced.

- _(none yet)_

## Data storage

Flashcards live in plain JSON under `public/data/`, one file per category
(`nouns.json`, and later `verbs.json`, `adjectives.json`, etc.). This was
chosen over a CSV/text file, a Latin dictionary API, or a local database:
JSON is easy to hand-edit, supports the structured fields the app needs
(like splitting the genitive into `stem`/`ending` so only the ending gets
bolded), needs no server, and — being plain files rather than anything
React/Vite-specific — is read directly by both the web app and the
terminal CLI (`cli/index.mjs`), in the same repo, with no duplication.

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

To add a 1st/2nd-declension adjective, append an entry to
`public/data/adjectives.json` in the triplet form instead:

```json
{
  "id": "adj-example",
  "partOfSpeech": "adjective",
  "adjectiveForm": "triplet",
  "masculine": "Altus",
  "feminine": "Alta",
  "neuter": "Altum",
  "declensionLabel": "1st/2nd",
  "english": "tall, deep"
}
```

To add a new category later: create `public/data/<category>.json`, add the
matching card type to `src/types/flashcard.ts`, add a render case in
`src/components/Flashcard/Flashcard.tsx` (and mirror it in
`cli/index.mjs`), and flip `enabled: true` for that category in
`src/data/categories.ts`.

## Background image

The app looks for a background photo at `public/images/roman-forum.jpg` and
falls back to a plain gradient if it isn't present (see `src/index.css`).
Drop a free-license Roman Forum photo at that exact path (e.g. from
[Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Forum_Romanum)
or [Unsplash](https://unsplash.com/s/photos/roman-forum)) and it will appear
automatically — no code changes needed. This wasn't fetched automatically
because this session's network access doesn't reach image-hosting sites.
