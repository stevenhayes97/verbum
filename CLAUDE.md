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

A future sentence-practice JSON file (not built yet) is the opposite:
every refresh is a **full wipe and regenerate**, not an append. The
point of that feature is testing translation ability, not sentence
recall, so the practice set must not accumulate into a fixed, memorizable
bank the way the vocab files intentionally do. When generating a fresh
batch, vary sentence structure and grammatical construction too, not
just which vocab words get slotted in — otherwise the sentence
*templates* become the thing that gets memorized instead.

## Sentence generation

Beginner-level guardrails for generating practice sentences, for now —
the user will loosen these as their Latin improves, so don't assume they
stay fixed:

- Nouns and adjectives: 1st, 2nd, and 3rd declension only. Skip 4th/5th
  declension nouns (e.g. Manus, Res) when picking words for a sentence.
- No adverbs.
- Verbs: present tense only, but use both active and passive voice for
  variety.
