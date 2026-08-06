#!/usr/bin/env node
// Mechanically checks the macron orthography of every Latin field in
// public/data/*.json against the rules documented in README.md's "Spelling
// Conventions" section. Plain Node, no dependencies, mirroring
// cli/index.mjs and check-translation-confidence.mjs.
//
// Vowel length is data the user learns as fact, so anything that can be
// checked without lexical judgement is checked here rather than trusted:
// the character set, the Unicode form, the paradigm-determined endings,
// and the positional-length rules. Everything else -- whether a given stem
// vowel is long by nature -- needs a dictionary and stays a human call.
//
// Usage:
//   node scripts/validate-macrons.mjs                 # check the working tree
//   node scripts/validate-macrons.mjs --base <ref>    # also diff against <ref>
//
// With --base, each Latin value is compared to the same value at that git
// ref with macrons folded off both sides. That proves a retrofit commit
// added diacritics and nothing else -- no silent respelling hiding in a
// 300-line orthography diff.
import { readFile, readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import path from 'node:path';

const run = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(REPO_ROOT, 'public', 'data');

const MACRON_VOWELS = 'āēīōūĀĒĪŌŪ';
const DISALLOWED_CHAR = new RegExp(`[^\\x20-\\x7E${MACRON_VOWELS}]`, 'u');

// Endings are fully determined by the declension/conjugation the entry
// already records, so they need no per-word judgement at all.
const NOUN_GENITIVE_ENDINGS = { 1: 'ae', 2: 'ī', 3: 'is', 4: 'ūs', 5: 'eī' };
const VERB_INFINITIVE_ENDINGS = { '1st': 'āre', '2nd': 'ēre', '3rd': 'ere', '4th': 'īre' };
// dō, dăre is the one 1st-conjugation verb whose infinitive a is short.
const ENDING_EXCEPTIONS = { 'verb-do': 'are' };
const ADVERB_ENDINGS = ['ē', 'iter', 'er'];

// Mirrors ordinal() in cli/index.mjs and src/utils/stemEnding.tsx.
const ORDINAL_SUFFIXES = { 1: 'st', 2: 'nd', 3: 'rd' };
function ordinal(n) {
  return `${n}${ORDINAL_SUFFIXES[n] ?? 'th'}`;
}

// JS \b is ASCII-only, so it would see a boundary between "m" and "ī" and
// misread Ēmī as a macron before a final m. Spell the letter class out.
const LETTER = `A-Za-z${MACRON_VOWELS}`;
// A vowel immediately before nt, nd, or a word-final m is short.
const SHORT_BY_POSITION = new RegExp(`[${MACRON_VOWELS}](?:n[td]|m(?![${LETTER}]))`, 'u');
// A vowel before ns or nf is long -- so an unmarked one is suspect.
const LONG_BEFORE_NS_NF = /[aeiouAEIOU]n[sf]/u;
// "vocalis ante vocalem corripitur", with real exceptions (-īus, diēī, fīo).
const MACRON_BEFORE_VOWEL = new RegExp(`[${MACRON_VOWELS}][aeiouAEIOU]`, 'u');
const VOWEL_BEFORE_VOWEL_EXCEPTIONS = /(īus|ēī|fī)/u;

function annotate(level, message) {
  console.log(`::${level}::${message}`);
}

/**
 * Walks a parsed data file and yields every Latin-bearing string with a
 * dotted path describing where it came from. Everything not listed here is
 * English, metadata, or an id, and is deliberately skipped -- an English
 * gloss may legitimately contain characters this script would reject.
 */
const NON_LATIN_KEYS = new Set([
  'id',
  'english',
  'partOfSpeech',
  'tags',
  'notes',
  'examples',
  'gender',
  'declension',
  'declensionLabel',
  'adjectiveForm',
  'conjugation',
  'grammaticalCase',
  'category',
  'generated',
  'difficulty',
]);

function collectLatinValues(node, trail, out) {
  if (typeof node === 'string') {
    out.push({ path: trail, value: node });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((child, i) => collectLatinValues(child, `${trail}[${i}]`, out));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, child] of Object.entries(node)) {
      if (NON_LATIN_KEYS.has(key)) continue;
      collectLatinValues(child, trail ? `${trail}.${key}` : key, out);
    }
  }
}

export function foldMacrons(text) {
  return text.normalize('NFD').replace(/̄/g, '').normalize('NFC');
}

function entryLabel(entry, index) {
  return entry?.id ?? `#${index + 1}`;
}

/** Character-set, Unicode-form, and positional-length checks. */
function checkValue(file, where, value, errors, warnings) {
  const disallowed = value.match(DISALLOWED_CHAR);
  if (disallowed) {
    const code = disallowed[0].codePointAt(0).toString(16).padStart(4, '0');
    errors.push(`[${file}] ${where}: "${value}" contains U+${code.toUpperCase()} — only ${MACRON_VOWELS} are allowed outside ASCII.`);
  }

  if (value.normalize('NFC') !== value) {
    errors.push(`[${file}] ${where}: "${value}" is not NFC-normalized — use precomposed vowels (ā = U+0101), not a combining macron (U+0304).`);
  }

  const short = value.match(SHORT_BY_POSITION);
  if (short) {
    errors.push(`[${file}] ${where}: "${value}" macrons a vowel before "${short[0].slice(1)}" — vowels before nt, nd and word-final m are short.`);
  }

  for (const word of value.split(new RegExp(`[^${LETTER}]+`, 'u')).filter(Boolean)) {
    if (LONG_BEFORE_NS_NF.test(word)) {
      warnings.push(`[${file}] ${where}: "${word}" has an unmarked vowel before ns/nf — that position is long (Īnsula, Cōnsul, Mēnsa).`);
    }
    if (MACRON_BEFORE_VOWEL.test(word) && !VOWEL_BEFORE_VOWEL_EXCEPTIONS.test(word)) {
      warnings.push(`[${file}] ${where}: "${word}" has a long vowel directly before another vowel — usually short (vocalis ante vocalem corripitur).`);
    }
  }
}

/** Endings that the entry's own declension/conjugation field pins down. */
function checkEndings(file, cards, errors) {
  cards.forEach((card, index) => {
    const label = entryLabel(card, index);

    if (card.partOfSpeech === 'noun' || card.adjectiveForm === 'declined') {
      const expected = NOUN_GENITIVE_ENDINGS[card.declension];
      const actual = card.genitive?.ending;
      if (expected && actual !== expected) {
        errors.push(`[${file}] ${label}: genitive ending "${actual}" — ${ordinal(card.declension)} declension takes "${expected}".`);
      }
    }

    if (card.partOfSpeech === 'verb') {
      const expected = ENDING_EXCEPTIONS[card.id] ?? VERB_INFINITIVE_ENDINGS[card.conjugation];
      const actual = card.infinitive?.ending;
      if (expected && actual !== expected) {
        errors.push(`[${file}] ${label}: infinitive ending "${actual}" — ${card.conjugation} conjugation takes "${expected}".`);
      }
    }

    if (card.partOfSpeech === 'adverb') {
      const actual = card.adverb?.ending;
      if (!ADVERB_ENDINGS.includes(actual)) {
        errors.push(`[${file}] ${label}: adverb ending "${actual}" — expected one of ${ADVERB_ENDINGS.join(', ')}.`);
      }
    }
  });
}

/**
 * Compares every Latin value against the same value at a git ref, macrons
 * folded off both sides. Any mismatch means the change was more than
 * diacritics -- a respelling, a typo, or an entry that moved.
 */
async function checkAgainstBase(file, values, base, errors) {
  let raw;
  try {
    const { stdout } = await run('git', ['show', `${base}:public/data/${file}`], { cwd: REPO_ROOT, maxBuffer: 10 * 1024 * 1024 });
    raw = stdout;
  } catch {
    // New file at this ref -- nothing to compare against.
    return;
  }

  const baseValues = [];
  collectLatinValues(JSON.parse(raw), '', baseValues);
  const baseByPath = new Map(baseValues.map((v) => [v.path, v.value]));

  for (const { path: where, value } of values) {
    const before = baseByPath.get(where);
    if (before === undefined) continue;
    const folded = foldMacrons(value);
    if (folded !== foldMacrons(before)) {
      errors.push(`[${file}] ${where}: "${before}" → "${value}" changes more than macrons (folds to "${folded}", was "${foldMacrons(before)}").`);
    }
  }
}

async function main() {
  const baseIndex = process.argv.indexOf('--base');
  const base = baseIndex === -1 ? null : process.argv[baseIndex + 1];

  const errors = [];
  const warnings = [];
  let valueCount = 0;

  const files = (await readdir(DATA_DIR)).filter((f) => f.endsWith('.json')).sort();

  for (const file of files) {
    const parsed = JSON.parse(await readFile(path.join(DATA_DIR, file), 'utf8'));

    const values = [];
    collectLatinValues(parsed, '', values);
    valueCount += values.length;

    for (const { path: where, value } of values) {
      checkValue(file, where, value, errors, warnings);
    }

    if (Array.isArray(parsed.cards)) checkEndings(file, parsed.cards, errors);
    if (base) await checkAgainstBase(file, values, base, errors);
  }

  for (const message of errors) annotate('error', message);
  for (const message of warnings) annotate('warning', message);

  console.log(
    `Macron validation: ${valueCount} Latin values across ${files.length} files — ${errors.length} error(s), ${warnings.length} warning(s).`,
  );

  if (errors.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  annotate('error', `Macron validation crashed: ${error.stack ?? error.message}`);
  process.exitCode = 1;
});
