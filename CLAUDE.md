# Instructions for Claude

## Vocabulary data entry

Whenever adding or editing entries in `public/data/*.json`, validate the
English translation for accuracy before committing — don't just take a
proposed gloss at face value. If a word has a well-known primary meaning
plus other senses, note the closest/common one(s), the way existing
entries already do (e.g. `"lord, master"`, `"to warn, advise"`).

Also check new entries against the standing conventions documented in
`README.md`: the `I` over `J` spelling preference and the **macron rules**
("Spelling Conventions"), and the canonical tag list ("Vocabulary Tags")
if tags are being assigned.

**Every Latin field carries macrons** — `Amō`, not `Amo`; `Mātr` + `is`,
not `Matr` + `is`. Endings are determined by the entry's own
declension/conjugation and must match the paradigm exactly (1st decl. gen.
`-ae`, 2nd `-ī`, 3rd `-is`, 4th `-ūs`, 5th `-eī`; 1st conj. inf. `-āre`,
2nd `-ēre`, 3rd `-ere`, 4th `-īre`; adverbs `-ē`/`-iter`/`-er`). Look the
stem vowels up rather than guessing — a wrong macron teaches the word
wrong. Run `npm run validate:macrons` before committing; it catches the
mechanical mistakes but not a stem vowel that's simply the wrong length.

## Data file lifecycles

Vocab files (`public/data/nouns.json`, `verbs.json`, `adjectives.json`,
`adverbs.json`, and future part-of-speech files) are **append + edit
only** — add new entries or correct existing ones, but never wipe or
wholesale-regenerate one of these files.

`public/data/favorites.json` (the user's personal "favorite words" list,
shown as a table) follows this same **append + edit only** lifecycle —
it's meant to accumulate as a running collection, never wiped.

The two sentence files — `public/data/sentences.json` (Latin → English)
and `public/data/sentences-en-la.json` (English → Latin) — are the
opposite: every refresh is a **full wipe and regenerate**, not an
append. The point of that feature is testing translation ability, not
sentence recall, so the practice set must not accumulate into a fixed,
memorizable bank the way the vocab files (and favorites.json)
intentionally do. When generating a fresh batch, vary sentence structure
and grammatical construction too, not just which vocab words get slotted
in — otherwise the sentence *templates* become the thing that gets
memorized instead. Vary the premise as well: new characters, new
settings, new situations each time, so the little stories described
under "Paragraph coherence" below don't become the memorizable thing
either.

Regenerate the two files **independently**, and give them different
premises from each other, not just from their own previous batch. If
both directions drill the same little stories, the English → Latin set
stops testing composition and starts testing recall of Latin the user
just read in the other direction.

## Sentence generation

Beginner-level guardrails for generating practice sentences, for now —
the user will loosen these as their Latin improves, so don't assume they
stay fixed. Everything in this section — these guardrails, the difficulty
tiers, and the paragraph-coherence rules — applies to **both** sentence
files; nothing below changes with the direction of the batch:

- Unless a specific count is requested, generate 15 sentences per batch.
- Latin sentences carry macrons, same as the vocab files — see the
  "Macrons" rules in `README.md`. Mark the case endings too, since that's
  where vowel length does the most grammatical work (`puellā` ablative vs.
  `puella` nominative).
- Nouns and adjectives: 1st, 2nd, and 3rd declension only. Skip 4th/5th
  declension nouns (e.g. Manus, Res) when picking words for a sentence.
- No adverbs.
- Verbs: present tense only, but use both active and passive voice for
  variety.
- Avoid sentences where a modifier (prepositional phrase, adjective, etc.)
  could plausibly attach to more than one word, producing multiple valid
  English translations. E.g. "Nauta in insula amicum meum videt" reads
  equally well as "the sailor, on the island, sees my friend" or "the
  sailor sees my friend, who is on the island" — there's no way to tell
  from the Latin which one is intended, which makes it impossible to
  check a student's answer against one canonical translation. When a
  sentence could go either way, restructure it (word order, a different
  preposition, or splitting into a relative clause) until only one
  reading holds.

  This rule is about **readings that survive the context**, not about
  endings that happen to look alike. Latin is full of syncretism — 1st
  declension dative and genitive singular are both `-ae`, dative and
  ablative plural are both `-īs`, and so on — and resolving those from
  the surrounding words is exactly the skill being practised, not a
  defect. `Nepōs aviae flōrem dat` is fine: `aviae` is formally genitive
  too, but `dat` settles it, and "the grandson gives the grandmother's
  flower" isn't a reading anyone actually arrives at. Only flag a
  sentence when both readings are still standing *after* the reader has
  used the context — as in the `in insulā` example above, where nothing
  in the sentence tells you which noun the phrase attaches to.

### English → Latin batches

`sentences-en-la.json` is practised in the other direction: the English
is the prompt and the Latin is the answer, so the English side carries
extra weight. Write it so it pins down everything the Latin has to
encode — singular vs plural, who does what to whom, whose thing it is,
and whether a possessive is reflexive ("his own dog", not "his dog").
The student checks their own composition against the Latin face, and
Latin word order is free, so they aren't matching a string — but they
shouldn't have to guess which case or number the English meant.

The reverse of the ambiguity rule applies too: don't write an English
prompt that has two reasonable Latin renderings differing in grammar
rather than word choice.

### Difficulty tiers

Every sentence gets a `difficulty: "easy" | "intermediate" | "challenging"`
field. All three tiers stay within the guardrails above (present tense
only, 1st–3rd declension, no adverbs) — difficulty comes from vocabulary
and structure, not from unlocking new grammar early:

- **easy** — short (roughly 4–6 words), common/high-frequency vocab, one
  clause, simple SVO/SOV order, mostly active voice.
- **intermediate** — slightly longer (roughly 6–9 words), a mix of active
  and passive voice, dative indirect objects and/or possessive adjectives,
  broader vocab.
- **challenging** — longer (roughly 8–12 words), denser modifier use
  (multiple adjectives/genitives per noun), more 3rd-declension nouns and
  adjectives, passive voice with an ablative agent (a/ab), less common
  vocab — while still respecting the unambiguous-modifier rule above.

  **`a/ab` marks a *personal* agent only** — someone who acts. An
  inanimate cause takes a bare ablative of means with no preposition:
  `ā iūdice regitur` ("ruled by the judge") but `lēgibus mūnītur`
  ("fortified by the laws"), not `ā lēgibus`. Getting this wrong is easy
  precisely because this tier asks for ablative agents, so check the
  animacy of every agent before using `a/ab`.

Unless told otherwise, split a batch evenly across the three tiers (e.g.
a default batch of 15 = 5 easy / 5 intermediate / 5 challenging).

### Paragraph coherence

Each difficulty grouping reads as a **single coherent paragraph** — a
little mini-story — not a pile of disconnected sentences. The sentences
in a tier share characters, a setting, and a through-line, and they're
written to be read in file order: the first sentence opens the scene,
the last one closes it. The app presents sentences in file order, so
narrative order in `sentences.json` is the order the user practices in.

The three paragraphs must be **unrelated to each other** — three
separate mini-stories with their own casts and settings, not one
narrative split across the tiers and not three chapters of the same
story. A default batch of 15 is therefore three 5-sentence stories:
one easy, one intermediate, one challenging, with nothing carrying over
between them.

To let the prose actually flow, two categories of cohesion vocabulary
are allowed even when they aren't in the vocab files:

- Conjunctions — `et`, `sed`, `nam`, `itaque`, `quod`, `ubi`.
- Personal and demonstrative pronouns — `is/ea/id`, `hic`, `ille`.

Adverbs are still off-limits, which rules out the obvious sequencing
words (`deinde`, `tum`, `postea`). Carry sequence with conjunctions and
word order instead.

The unambiguous-translation rule above extends to pronoun reference. A
sentence still has to yield one canonical English translation **on its
own**, without the reader inferring a referent from its neighbours — so
when two masculine referents are in play, don't lean on a bare `eum` to
pick one out; repeat the noun. Cohesion should come from continuity of
scene and repeated named characters first, pronouns only where the
referent is unmistakable.
