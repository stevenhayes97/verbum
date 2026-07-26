# Verbum

Project Verbum - a local Latin flashcard app.

Latin on the front, English on the back. The app currently ships with
**Nouns**, **Adjectives**, **Verbs**, **Adverbs**, and **Prepositions** —
all five originally planned categories; **Other** is stubbed in the UI
for whatever doesn't fit those, and will be filled in later.

## Running locally

```bash
npm install
npm run dev
```

Then open the printed URL in a browser — note it's `http://localhost:5173/verbum/`,
not the bare root, since `vite.config.ts` sets `base: '/verbum/'` to match
the GitHub Pages deploy path (see "Deployment" below).

`npm run build && npm run preview` builds and serves the production bundle.

### Terminal version

A plain-Node CLI reads the same `public/data/*.json` files (no build step,
no dependencies):

```bash
npm run cli
```

Pick a deck, then press Enter to reveal the English translation, `n`/`p`
to move next/prev, `s` to shuffle, `q` to quit.

## Deployment

The web app deploys to GitHub Pages at
**https://stevenhayes97.github.io/verbum/** via
`.github/workflows/deploy.yml`, which builds and publishes `dist/`
automatically on every push to `main`. No third-party service is
involved — Pages is a built-in GitHub feature, so nothing beyond the
existing repo access is granted to anyone.

**One-time manual step required** (can't be done via API/CLI): in the
repo's Settings → Pages, set "Build and deployment" → Source to
**"GitHub Actions"**. Until that's set, the workflow's deploy step will
fail even though the build succeeds.

Because the site is served from a subpath (`/verbum/`) rather than a
domain root, `vite.config.ts` sets `base: '/verbum/'`, and anything that
would otherwise use a root-absolute path (`/data/...`, `/images/...`)
has to account for that instead:
- `src/data/categories.ts`'s `dataUrl`s are built from
  `import.meta.env.BASE_URL` rather than hardcoded `/data/...` paths.
- The background image is applied as an inline style in `App.tsx` (built
  from `import.meta.env.BASE_URL` too), not as a plain CSS `url(...)` in
  `index.css` — Vite doesn't rewrite root-absolute CSS `url()`s for a
  non-root `base`, so a hardcoded path there would silently 404 in
  production while still working in dev.

## Card format

Adjective format depends on which of two Latin patterns a word follows —
mixing these up loses information, so it's worth getting right per word:

- **One-termination adjectives** (felix, prudens, ...) share a single
  nominative form across all genders, distinguished only by genitive —
  exactly like a noun. These, and all nouns, show **Nominative / Genitive
  / Declension / Gender** (e.g. `Pater / Patris / 3rd / Male`, or `Felix /
  Felicis / 3rd / Male`), with the non-stem part of the genitive bolded.
- **Triplet-form adjectives** have distinct forms per gender, so they show
  **Masculine / Feminine / Neuter** instead. This covers both 1st/2nd
  declension adjectives (bonus, magnus, ...), e.g. `Bonus / Bona / Bonum
  (1st/2nd decl.)`, *and* 3rd-declension two-termination adjectives
  (fortis, brevis, omnis, ...) where masculine and feminine happen to
  share a form and only the neuter differs, e.g. `Omnis / Omnis / Omne
  (3rd decl.)`. Only `declensionLabel` differs between the two.

Either way, the back shows the English translation.

Verbs show the standard Latin citation form — the four **principal
parts**: 1st singular present / infinitive / 1st singular perfect /
perfect passive participle (PPP), with conjugation shown parenthetically,
e.g. `Amo / Amare / Amavi / Amatus (1st conj.)`. The infinitive's ending
is bolded, the same way the genitive's ending is bolded for nouns —
it's what reveals the conjugation (`-are`/`-ere`/`-ere`/`-ire` for
1st/2nd/3rd/4th). The perfect stem is often irregular and can't be
derived from the present stem (`video` → `vidi`, not `videvi`; `aperio` →
`aperui`, not the expected `aperivi`), which is exactly why it's an
explicit field rather than inferred.

Note: all current seed verbs are regular and transitive, so the PPP is
always the plain `-us` form. Deponent and intransitive verbs (which don't
cleanly take that form — e.g. `venio`'s 4th part is conventionally the
supine `ventum`, not `ventus`) are deliberately not included yet; how to
represent them is an open design question for when one gets added.

Adverbs are indeclinable — a single fixed form, no gender/case/number
variation — so unlike nouns/adjectives/verbs there's no multi-form
citation to show. The card is just the adverb itself, with its ending
bolded, plus the adjective it derives from for the pattern connection:
e.g. `Fortiter (from Fortis)`. Formation is predictable from the source
adjective's declension: 1st/2nd declension adjectives add `-ē` to the
stem (`longus` → `longē`), 3rd declension adjectives add `-iter` (or
just `-er` if the stem already ends in `-nt`, e.g. `prudens` → `prudenter`
not `prudentiter`). Irregular/suppletive adverbs (e.g. `bonus` → `bene`,
not the regular `bone`) are deliberately not included yet, same reasoning
as the deferred deponent verbs.

Prepositions show which case they govern — that's the grammatically
essential fact about a Latin preposition, since English prepositions
carry no case information at all. The card is `{preposition} (+ {case})`,
e.g. `Cum (+ Ablative)`, `Ad (+ Accusative)`; no bolding, since a
preposition itself doesn't decline. Most prepositions take a single
fixed case, but `in` and `sub` genuinely take either case with a real
meaning shift (static location vs. motion), so each gets **two separate
cards** rather than one entry with two meanings: `In (+ Ablative)` → "in,
on" vs. `In (+ Accusative)` → "into, onto". `Super`/`subter` (the other
Latin prepositions that can take either case) are deliberately not
included yet — same reasoning as other deferred edge cases.

## Spelling Conventions

Classical Latin orthography sometimes allows either `I` or `J` for the
same sound (e.g. `Ianuarius`/`Januarius`, `maior`/`major`, `eius`/`ejus`).
**Prefer `I` over `J`** consistently across all vocabulary entries.

## Word IDs

Each card's `id` is `<part-of-speech prefix>-<word>` (lowercase), e.g.
`noun-pater`, `adj-bonus`, `verb-amo`, `adv-longe`.

Latin homographs across *different* parts of speech (e.g. `malus` the
adjective "bad" vs. `malus` the noun "apple tree") don't need any special
handling — they naturally get different prefixes (`adj-malus` vs.
`noun-malus`) since each category is its own file.

Only when two entries of the **same** part of speech would otherwise
share an id (e.g. `levis` meaning "light" and `levis` meaning "smooth"
are two distinct Latin adjectives) does it need disambiguating: append
the simplest/shortest English translation as a suffix, not the full
gloss — `adj-levis-light` and `adj-levis-smooth`, not
`adj-levis-light-in-weight`.

A related but different case: dual-case prepositions like `in`/`sub`
aren't homographs — it's the *same* word, not two distinct ones — so
they're disambiguated by case instead of by meaning: `prep-in-ablative` /
`prep-in-accusative`, `prep-sub-ablative` / `prep-sub-accusative`.
Single-case prepositions use the plain pattern (`prep-ab`, `prep-cum`).

## Vocabulary Tags

Every card can optionally carry `tags: string[]` — thematic labels (e.g.
`family`, `royalty`) independent of part-of-speech, for pulling
category-based vocabulary sets that cut across nouns/adjectives/etc. later:

```json
"tags": ["people", "royalty"]
```

Tags are assigned on demand by asking Claude to tag a batch of words —
there's no runtime tagging logic in the app itself, to keep it static and
dependency-free.

**Canonical tag list**: before adding a new tag, check this list first and
reuse an existing one if it fits, to avoid near-duplicates like `war` /
`military` / `battle` meaning the same thing. New tags get added here as
they're introduced.

- `family` — kinship terms (Pater, Mater, Frater, Soror)
- `people` — persons / social roles (Rex, Puella, Nauta, Dominus, Servus, Femina, Amicus, Homo, Agricola, Poeta, Puer)
- `royalty` — kingship, rule (Rex)
- `religion` — sacred, temple-related (Templum, Deus, Caelum)
- `body` — body parts (Manus, Corpus, Caput)
- `abstract` — generic/non-concrete nouns (Res, Verbum, Nomen, Vox, Fortuna, Vita, Fama, Animus, Periculum, Veritas, Origo, Mors, Ars)
- `size` — physical dimension: big/small/long/short (Magnus, Parvus, Longus, Brevis)
- `character` — personal qualities/traits: virtue, fortune, disposition (Bonus, Fortis, Felix, Virtus)
- `quantity` — quantifiers (Omnis, Pars)
- `possessive` — possessive adjectives (Meus, Tuus, Suus, Noster, Vester)
- `nature` — natural world/elements (Aqua, Terra, Silva, Flumen, Mons, Insula, Stella, Luna, Ager, Caelum)
- `place` — locations/geography (Via, Urbs, Locus, Oppidum, Iter)
- `animals` (Equus)
- `objects` — physical items (Liber, Porta, Donum)
- `military` — war, army (Bellum, Miles, Dux)
- `politics` — governance, civic life (Civitas, Lex, Pax, Dux, Populus, Libertas, Ordo)
- `time` (Tempus)
- `emotion` (Ira)

## Custom Sets

An **All** deck sits alongside the part-of-speech tabs (Nouns, Verbs, ...)
and merges every enabled category together — this is where tags earn
their keep, since a tag like `military` can span nouns, adjectives, verbs,
and adverbs at once. Above the flashcard, a **Tag** dropdown (built from
whatever tags actually appear in the currently loaded deck, each with a
live count — not a hardcoded list) and a **Count** field let you narrow
down to a themed subset of any size, in any deck, not just All. Both
apply instantly and re-shuffle; a **Reset** button appears once either is
set. Picking a deck with no tagged cards yet (e.g. Verbs, Adverbs) just
shows "All tags" until something in it gets tagged.

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

To add a triplet-form adjective (1st/2nd declension, or 3rd declension
two-termination), append an entry to `public/data/adjectives.json`:

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

To add a verb, append an entry to `public/data/verbs.json`:

```json
{
  "id": "verb-example",
  "partOfSpeech": "verb",
  "presentFirstSingular": "Specto",
  "infinitive": { "stem": "Spect", "ending": "are" },
  "perfectFirstSingular": "Spectavi",
  "perfectPassiveParticiple": "Spectatus",
  "conjugation": "1st",
  "english": "to watch, look at"
}
```

To add an adverb, append an entry to `public/data/adverbs.json`:

```json
{
  "id": "adv-example",
  "partOfSpeech": "adverb",
  "adverb": { "stem": "Cert", "ending": "e" },
  "sourceAdjective": "Certus",
  "english": "certainly"
}
```

To add a preposition, append an entry to `public/data/prepositions.json`:

```json
{
  "id": "prep-sine",
  "partOfSpeech": "preposition",
  "preposition": "Sine",
  "grammaticalCase": "Ablative",
  "english": "without"
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
