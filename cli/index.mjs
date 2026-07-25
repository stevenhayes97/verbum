#!/usr/bin/env node
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

// Mirrors the enabled entries in src/data/categories.ts.
const CATEGORIES = [
  { id: 'nouns', label: 'Nouns', file: 'nouns.json' },
  { id: 'adjectives', label: 'Adjectives', file: 'adjectives.json' },
  { id: 'verbs', label: 'Verbs', file: 'verbs.json' },
  { id: 'adverbs', label: 'Adverbs', file: 'adverbs.json' },
];

const BOLD_RED = '\x1b[1;31m';
const RESET = '\x1b[0m';

const ORDINAL_SUFFIXES = { 1: 'st', 2: 'nd', 3: 'rd' };
function ordinal(n) {
  return `${n}${ORDINAL_SUFFIXES[n] ?? 'th'}`;
}

function declinedFront(card) {
  const genitive = `${card.genitive.stem}${BOLD_RED}${card.genitive.ending}${RESET}`;
  return `${card.nominative} / ${genitive} / ${ordinal(card.declension)} / ${card.gender}`;
}

function tripletFront(card) {
  return `${card.masculine} / ${card.feminine} / ${card.neuter} (${card.declensionLabel} decl.)`;
}

function verbFront(card) {
  const infinitive = `${card.infinitive.stem}${BOLD_RED}${card.infinitive.ending}${RESET}`;
  return `${card.presentFirstSingular} / ${infinitive} / ${card.perfectFirstSingular} / ${card.perfectPassiveParticiple} (${card.conjugation} conj.)`;
}

function adverbFront(card) {
  const adverb = `${card.adverb.stem}${BOLD_RED}${card.adverb.ending}${RESET}`;
  return `${adverb} (from ${card.sourceAdjective})`;
}

function frontText(card) {
  switch (card.partOfSpeech) {
    case 'noun':
      return declinedFront(card);
    case 'adjective':
      return card.adjectiveForm === 'triplet' ? tripletFront(card) : declinedFront(card);
    case 'verb':
      return verbFront(card);
    case 'adverb':
      return adverbFront(card);
    default:
      return card.nominative ?? card.masculine ?? '?';
  }
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

async function chooseCategory(rl) {
  console.log('Verbum — choose a deck:\n');
  CATEGORIES.forEach((c, i) => console.log(`  [${i + 1}] ${c.label}`));

  while (true) {
    const answer = (await rl.question('\n> ')).trim();
    const choice = CATEGORIES[Number(answer) - 1];
    if (choice) return choice;
    console.log('Not a valid choice, try again.');
  }
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });
  const category = await chooseCategory(rl);

  const raw = await readFile(path.join(DATA_DIR, category.file), 'utf8');
  const { cards } = JSON.parse(raw);

  let deck = cards;
  let index = 0;
  let revealed = false;

  while (true) {
    const card = deck[index];
    console.log(`\nVerbum — ${category.label} (${index + 1}/${deck.length})\n`);
    console.log(frontText(card));
    if (revealed) console.log(`\n→ ${card.english}`);

    const prompt = revealed
      ? '\n[n] Next  [p] Prev  [s] Shuffle  [q] Quit > '
      : '\n[Enter] Reveal  [n] Next  [p] Prev  [s] Shuffle  [q] Quit > ';

    const answer = (await rl.question(prompt)).trim().toLowerCase();

    if (answer === 'q') break;
    if (answer === 'n') {
      index = (index + 1) % deck.length;
      revealed = false;
    } else if (answer === 'p') {
      index = (index - 1 + deck.length) % deck.length;
      revealed = false;
    } else if (answer === 's') {
      deck = shuffle(deck);
      index = 0;
      revealed = false;
    } else if (answer === '') {
      revealed = true;
    }
  }

  rl.close();
  console.log('\nVale!');
}

main();
