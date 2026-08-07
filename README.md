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

### If a deploy fails, don't re-run it — push a new commit

A Pages deployment's id **is the commit SHA**, so a given commit gets one
shot. If `actions/deploy-pages` gives up (its `timeout:` elapses while the
deployment sits in `deployment_queued`, usually a Pages-side stall), it
*cancels* that deployment on its way out. The SHA is then spent: re-running
the same workflow run finds the cancelled record and fails within seconds
with a bare **"Deployment cancelled."**, which looks like a fresh failure
but is really an echo of the first one. Re-running will never clear it.

Recovery is a new commit on `main` — a new SHA means a new deployment id
and a clean queue entry. Worth knowing before burning three re-runs on it,
since the error message gives no hint of any of this. The build job going
green while only `deploy` fails is the tell that the problem is Pages-side
rather than anything in the app.

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

## Translation Review Judges

Every pull request runs two independent GitHub Actions checks that catch
mistranslations before they land, on top of the manual review already
expected per `CLAUDE.md`:

- **Iudex** ("judge", in Latin) — `.github/workflows/iudex.yml`
- **Altera Sententia** ("the other opinion", in Latin) — `.github/workflows/altera-sententia.yml`

Both are thin wrappers around the same shared logic in
`.github/workflows/translation-judge.yml` (a reusable workflow), so they
behave identically apart from which model does the judging. Each only
looks at what that PR actually changed — the entries added or edited in
`public/data/*.json` — not the whole vocabulary bank, so unrelated PRs
aren't affected by pre-existing entries and the deck doesn't get re-graded
from scratch every time.

For each added/modified entry, a judge uses the [Cursor CLI](https://cursor.com/docs/cli)
(`agent -p`, the same headless agent behind Cursor's Cloud Agents) as an LLM
judge, asking it to score how confident it is that the `english` field
correctly translates the corresponding Latin, per this repo's own
conventions (spelling preferences, sense selection, etc. — the same rules a
human or Claude would apply when adding an entry):

- **≥ 95% confidence** — passes silently.
- **90–95% confidence** — posts a warning annotation on the check, but
  doesn't fail the PR.
- **< 90% confidence** — fails the check (a non-zero exit from the
  workflow job).

A failing check only *blocks merging* if it's configured as a required
status check under the branch protection rule for `main` (Settings →
Branches) — that's a one-time manual setup step, same as the Pages source
setting above; the two judges can be required independently (e.g. only
Iudex gates merges, Altera Sententia stays advisory) if you don't want both
to block. Both workflows need the same `CURSOR_API_KEY` repo secret
(Settings → Secrets and variables → Actions), generated from
[cursor.com/dashboard/api](https://cursor.com/dashboard/api), to authenticate
the CLI.

**Why two judges, deliberately from different labs:** sentences are
generated by Claude (Sonnet, per the "Sentence Practice" section below),
and Iudex's own default judge model is also Claude (Opus) — so relying on
Iudex alone would mean one lab's model both writing and grading the same
content. Altera Sententia runs the identical review independently as a
Grok agent instead, as a genuine second opinion from a different model
family, rather than a rubber stamp on Iudex's verdict.

Each judge's model is set via its own workflow's `model` input, overridable
without editing either file via a repo Actions variable — `IUDEX_MODEL`
(defaults to a high-reasoning Claude Opus variant) and
`ALTERA_SENTENTIA_MODEL` (defaults to a high-effort Grok 4.5 variant). Worth
double-checking both against `agent --list-models` on the account that owns
the key, since exact model slugs can change.

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
e.g. `Amō / Amāre / Amāvī / Amātus (1st conj.)`. The infinitive's ending
is bolded, the same way the genitive's ending is bolded for nouns —
it's what reveals the conjugation (`-āre`/`-ēre`/`-ere`/`-īre` for
1st/2nd/3rd/4th). Note that this only works because of the macrons: 2nd
and 3rd conjugation are both `-ere` unmarked, so without vowel length the
bolded ending would distinguish nothing for half the verbs (`monēre` vs.
`regere`). The perfect stem is often irregular and can't be
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
just `-er` if the stem already ends in `-nt`, e.g. `prūdēns` → `prūdenter`
not `prūdentiter`). Irregular/suppletive adverbs (e.g. `bonus` → `bene`,
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

### Macrons

All Latin text carries macrons — vocabulary entries, sentences, favorites,
and the declension tables alike. Vowel length is phonemic in Latin
(`liber` "book" vs. `līber` "free"; nominative `puella` vs. ablative
`puellā`), so leaving it off means learning the words wrong. The rules:

1. Mark every vowel that is **long by nature**, following Lewis & Short /
   the Oxford Latin Dictionary. Don't mark vowels that are merely long by
   position: `magnus` stays `magnus`, not `māgnus`.
2. A vowel before `ns` or `nf` **is** long: `Īnsula`, `Cōnsul`, `Mēnsa`,
   `Trāns`, `Sapiēns`.
3. A vowel immediately before `nt`, `nd`, or a word-final `-m` is **short**
   and never takes a macron: `amant`, `amandus`, `puellam`.
4. Length is **position-dependent within a word's paradigm** — the same
   letter can be long in one form and short in another. `Dēns` but genitive
   stem `Dent-`; `Mōns` but `Mont-`. This is exactly why endings are filled
   from the paradigm rather than copied off the nominative.
5. Store **precomposed NFC** codepoints (`ā` = U+0101), never `a` followed
   by a combining macron (U+0304). The two render identically but don't
   compare equal.
6. The only characters allowed outside ASCII are `ā ē ī ō ū Ā Ē Ī Ō Ū`.
   Capitalised headwords keep the macron on the capital: `Īra`, `Ōs`.
7. Diphthongs (`ae`, `au`, `oe`, `eu`) are inherently long and take no
   macron: `Nauta`, `Prae`, `Aurōra` — the `ō` is marked, the `au` isn't.
8. Where the dictionaries disagree — typically a vowel before a doubled
   consonant, like `stella` — follow the beginner-textbook convention and
   leave it **unmarked**. The point is to teach the reading a student will
   meet elsewhere, not to adjudicate etymology.

Macrons are **display-only, never something you have to type**. The vocab
list's search box folds them off both sides (`src/utils/latin.ts`), so
searching `rex` finds `Rēx` and `amare` finds `Amō, amāre` — vowel length
is impractical to type on a laptop keyboard and isn't required anywhere.

`npm run validate:macrons` checks everything about this that can be checked
without a dictionary: the character set, the Unicode form, the
paradigm-determined endings (rules 4 above), and the positional rules 2 and
3. It runs in CI via `.github/workflows/macrons.yml`. Given a `--base <ref>`
it additionally asserts that every Latin value, macrons folded off, still
equals what it was at that ref — proof that a retrofit commit added
diacritics and didn't quietly respell anything. That baseline check applies
only to the **append + edit-only** files, which the script identifies by
the absence of a `generated` key; the two sentence files are wiped and
regenerated wholesale, so a total rewrite is correct there and holding them
to it would flag every line. What it *can't* check is
whether a given stem vowel is long by nature; that still needs a dictionary
and a human.

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

- `family` — kinship terms (Pater, Mater, Frater, Soror, Filius, Filia, Avus, Avia, Maritus, Uxor, Vir, Familia, Nepos, Neptis)
- `people` — persons / social roles (Rex, Puella, Nauta, Dominus, Servus, Femina, Amicus, Homo, Agricola, Poeta, Puer, Regina, Hostis, Centurio, Amica, Gladiator, Magister, Socius, Cantor)
- `royalty` — kingship, rule (Rex, Regina)
- `religion` — sacred, temple-related (Templum, Deus, Caelum, Sanctus, Numen, Oraculum, Immortalis, Iuppiter)
- `body` — body parts (Manus, Corpus, Caput, Pectus, Umerus, Bracchium, Crus, Pes, Membrum, Capillus, Os, Labrum, Auris, Collum, Dens, Cor, Venter, Tergum, Dorsum)
- `abstract` — generic/non-concrete nouns (Res, Verbum, Nomen, Vox, Fortuna, Vita, Fama, Animus, Periculum, Veritas, Origo, Mors, Ars, Gloria, Musa, Fatum, Aeternitas)
- `size` — physical dimension: big/small/long/short (Magnus, Parvus, Longus, Brevis, Altus)
- `character` — personal qualities/traits: virtue, fortune, disposition (Bonus, Fortis, Felix, Virtus, Fidelis, Gravis, Praeclarus, Ferox, Sapiens, Iustus)
- `quantity` — quantifiers (Omnis, Pars, Multus)
- `possessive` — possessive adjectives (Meus, Tuus, Suus, Noster, Vester)
- `nature` — natural world/elements (Aqua, Terra, Silva, Flumen, Mons, Insula, Stella, Luna, Ager, Caelum, Aurora, Umbra, Nox, Flos, Lapis, Mare)
- `place` — locations/geography (Via, Urbs, Locus, Oppidum, Iter, Schola, Europa)
- `animals` (Equus, Aquila, Draco, Avis, Piscis)
- `objects` — physical items (Liber, Porta, Donum, Mensa)
- `food` — food and drink (Cibus, Vinum)
- `military` — war, army (Bellum, Miles, Dux, Gladius, Hasta, Scutum, Legio, Hostis, Victoria, Proelium, Vulnus, Exercitus, Centurio, Imperator, Aquila, Vexillum, Triumphus, Gladiator, Socius)
- `politics` — governance, civic life (Civitas, Lex, Pax, Dux, Populus, Libertas, Ordo, Imperator, Senatus, Consul, Triumphus)
- `time` (Tempus, Novus, Vetus)
- `emotion` (Ira, Miser)
- `appearance` — physical/sensory descriptive qualities (Pulcher, Dulcis, Formosus, Candidus, Decorus, Venustus, Niger, Albus, Ruber, Clarus)

## Verb Tags

Verbs don't fit the topic-based list above — they're actions, not subject
domains, so most of them have no natural home in `family`, `body`,
`military`, etc. Verbs instead use a **separate, action-based** canonical
tag list, grouped by semantic type rather than theme. The same "check
first, reuse if it fits" rule applies before adding a new one:

- `perception` — Video, Audio
- `communication` — Voco, Laudo, Scribo, Moneo, Respondeo, Dico, Doceo, Cano, Canto
- `emotion` — Amo, Terreo, Invideo
- `possession` — Habeo, Do, Emo, Capio
- `motion` — Duco, Mitto, Porto, Tollo, Peto, Gesto, Veho
- `governance` — Rego, Munio, Custodio, Impero, Iubeo, Regno, Servo, Debello, Opprimo
- `change-of-state` — Paro, Finio, Aperio, Facio, Iungo
- `cognition` — Credo, Scio, Cogito, Quaero

The two tag lists are intentionally disjoint — a verb and a noun won't
usually match on the same tag in the "All" deck's filter — with one
deliberate exception: `emotion` is shared with the noun list above (Ira),
since the concept really is the same one.

## Custom Sets

An **All** deck sits alongside the part-of-speech tabs (Nouns, Verbs, ...)
and merges every enabled category together — this is where tags earn
their keep, since a tag like `military` can span nouns, adjectives, verbs,
and adverbs at once. Above the flashcard, an **Advanced** toggle — collapsed
by default so the flashcard stays front and center — expands into a row of
**Tag** toggle pills (built from whatever tags actually appear in the
currently loaded deck, each with a live count — not a hardcoded list) and
a **Count** field. Tags let you select up to 10 at once; a card matches if
it has *any* selected tag (OR, not AND), since most cards only carry one.
Once 10 are selected the rest disable until you deselect one. Count narrows
further to a subset of any size, in any deck, not just All. Filters apply
instantly and re-shuffle. When any tag or count filter is active, the
toggle's label summarizes it (e.g. "Advanced (2 tags · 14 cards)") even
while collapsed, and a **Reset** button stays visible next to it so you can
clear filters without expanding the panel. Picking a deck with no tagged
cards yet (e.g. Verbs, Adverbs) just shows no tag pills once expanded,
until something in it gets tagged.

## Sentence Practice

The **Sentence Practice** section (in the top nav, alongside Flashcards)
drills translation rather than recall. Same flip/Prev/Next interaction as
the vocab flashcards, but **no Shuffle button** — sentence order is
meaningful here (see below), so the cards always run in the order they're
written in the file. The tag/count customizer doesn't apply either —
sentences aren't tagged or split into decks.

A toggle above the card picks which way you're practising:

- **Latin → English** — the card shows a Latin sentence and tapping it
  reveals the English. Comprehension: read the Latin and understand it.
- **English → Latin** — the card shows an English sentence and tapping it
  reveals the Latin. Composition: build the sentence yourself, picking the
  cases, numbers and verb forms, then flip to check. Latin word order is
  free, so this is a self-check against a reasonable rendering rather than
  an exact-match answer.

The two directions have **separate sentence sets** — practising a story in
one direction would otherwise turn the same story into pure recall in the
other. They also keep separate state: each remembers its own tier
selection and its own place in the deck, so switching back and forth
doesn't lose either. Each set is fetched the first time you switch to it,
not on app load.

Each sentence carries a `difficulty` of `easy`, `intermediate`, or
`challenging`. A pill filter above the card lets you pick which tier(s) are
in play — Easy, Intermediate, Challenging, or All — and multiple tiers can
be selected at once; it defaults to Easy only. The filter works the same
way in both directions. See CLAUDE.md's "Sentence generation" section for
the rubric behind each tier.

Each tier is written as **one coherent paragraph** — a short story whose
sentences share characters and a setting and build on each other — so
Prev/Next walks you through a narrative rather than a random pile. The
three paragraphs are unrelated to one another: a batch of 15 is three
separate 5-sentence stories, one per tier. Selecting several tiers at once
plays their paragraphs back to back (easy, then intermediate, then
challenging) instead of interleaving them.

Each direction has its own file — `public/data/sentences.json` for Latin →
English and `public/data/sentences-en-la.json` for English → Latin — with
the same shape:

```json
{
  "generated": "2026-08-01",
  "sentences": [
    {
      "id": "sentence-1",
      "latin": "Miles fortis oppidum custodit.",
      "english": "The brave soldier guards the town.",
      "difficulty": "easy"
    }
  ]
}
```

**These files have the opposite lifecycle from the vocab files.** The vocab
files are append-and-edit-only; both sentence files are **wiped and
regenerated wholesale** on every refresh. The point of the feature is
testing translation ability, not sentence recall, so the practice set must
not accumulate into a fixed, memorizable bank. Regeneration should vary
sentence structure and grammatical construction too — not just swap which
vocab words get slotted into the same templates, or the templates become
the thing that gets memorized. The two files are regenerated independently
and given different premises from each other, for the same reason they're
separate sets in the first place. The `generated` date records when the
current batch was produced.

Sentences are generated by Claude against beginner-level guardrails
documented in `CLAUDE.md` (1st–3rd declension nouns and adjectives only,
no adverbs, present tense verbs in both active and passive voice). Those
guardrails loosen as the user's Latin improves. All three difficulty tiers
stay within these same guardrails — the tiers vary vocabulary and sentence
structure, not grammar. The one deliberate exception is cohesion: because
each tier has to read as a paragraph, conjunctions (`et`, `sed`, `nam`,
`itaque`) and demonstrative/personal pronouns (`is/ea/id`, `hic`, `ille`)
may be used even though they aren't in the vocab files. Adverbs stay
banned, sequencing words included.

English → Latin batches carry one extra requirement: the English prompt
has to pin down everything the Latin must encode — number, possession, who
does what to whom, and whether a possessive is reflexive — since it's the
prompt rather than the answer in that direction.

## Favorites

The **Favorites** section is a personal, growing list of favorite Latin
words — a reference table, not a quiz, so both columns are visible at once
instead of hidden behind a flip. Each row shows the Latin nominative and
genitive (e.g. "Imperium, imperii") next to the English translation.

Words live in `public/data/favorites.json`:

```json
{
  "words": [
    {
      "id": "favorite-imperium",
      "nominative": "Imperium",
      "genitive": "imperii",
      "english": "power, command, empire"
    }
  ]
}
```

Unlike `sentences.json`, this file follows the same **append + edit only**
lifecycle as the vocab files — it's meant to grow indefinitely as a running
collection, never wiped. It's deliberately a lighter shape than a full
`NounCard`: no declension number, gender, or stem/ending split, since
nothing here needs flashcard mechanics — just the two columns shown in the
table. Words can (and do) overlap with the main vocab decks; favoriting a
word you're already studying elsewhere is expected, not a duplicate to
avoid.

## Declension Tables

The **Declension Tables** section is a static grammar reference: quick
lookup charts of case endings for all five declensions, for when you need
to check an ending rather than quiz yourself on a word. It's not a quiz
and not a vocab list, so it sits outside the flashcard mechanics entirely.

Nine tables are shown, one per pattern that has genuinely different
endings from its neighbors — not just one table per declension number:

- 1st declension (*puella*)
- 2nd declension `-us` (*dominus*), 2nd declension `-er` (*liber*), and
  2nd declension neuter (*bellum*)
- 3rd declension (*rēx*) and 3rd declension neuter (*corpus*)
- 4th declension (*frūctus*) and 4th declension neuter (*cornū*)
- 5th declension (*rēs*)

Each table shows Nominative/Genitive/Dative/Accusative/Ablative/Vocative
across Singular/Plural.

Unlike the vocab and favorites files, this content lives in
`src/data/declensionTables.ts` as a hard-coded TypeScript module, not
`public/data/*.json`. It's fixed grammatical knowledge rather than a
growing or per-word collection, so it doesn't fit the append-only or
wipe-and-regenerate lifecycles those files follow — there's no fetch, no
loading state, and no expectation that it changes often.

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
