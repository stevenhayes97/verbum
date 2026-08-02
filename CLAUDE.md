# Instructions for Claude

## Vocabulary data entry

Whenever adding or editing entries in `public/data/*.json`, validate the
English translation for accuracy before committing — don't just take a
proposed gloss at face value. If a word has a well-known primary meaning
plus other senses, note the closest/common one(s), the way existing
entries already do (e.g. `"lord, master"`, `"to warn, advise"`).

Also check new entries against the standing conventions documented in
`README.md`: the `I` over `J` spelling preference ("Spelling Conventions"),
and the canonical tag list ("Vocabulary Tags") if tags are being assigned.

## Data file lifecycles

Vocab files (`public/data/nouns.json`, `verbs.json`, `adjectives.json`,
`adverbs.json`, and future part-of-speech files) are **append + edit
only** — add new entries or correct existing ones, but never wipe or
wholesale-regenerate one of these files.

`public/data/favorites.json` (the user's personal "favorite words" list,
shown as a table) follows this same **append + edit only** lifecycle —
it's meant to accumulate as a running collection, never wiped.

`public/data/sentences.json` is the opposite: every refresh is a **full
wipe and regenerate**, not an append. The point of that feature is
testing translation ability, not sentence recall, so the practice set
must not accumulate into a fixed, memorizable bank the way the vocab
files (and favorites.json) intentionally do. When generating a fresh
batch, vary sentence structure and grammatical construction too, not
just which vocab words get slotted in — otherwise the sentence
*templates* become the thing that gets memorized instead. Vary the
premise as well: new characters, new settings, new situations each
time, so the little stories described under "Paragraph coherence" below
don't become the memorizable thing either.

## Sentence generation

Beginner-level guardrails for generating practice sentences, for now —
the user will loosen these as their Latin improves, so don't assume they
stay fixed:

- Unless a specific count is requested, generate 15 sentences per batch.
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
