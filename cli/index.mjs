#!/usr/bin/env node
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '..', 'public', 'data', 'nouns.json');

const BOLD_RED = '\x1b[1;31m';
const RESET = '\x1b[0m';

const ORDINAL_SUFFIXES = { 1: 'st', 2: 'nd', 3: 'rd' };
function ordinal(n) {
  return `${n}${ORDINAL_SUFFIXES[n] ?? 'th'}`;
}

function frontText(card) {
  const genitive = `${card.genitive.stem}${BOLD_RED}${card.genitive.ending}${RESET}`;
  return `${card.nominative} / ${genitive} / ${ordinal(card.declension)} / ${card.gender}`;
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

async function main() {
  const raw = await readFile(DATA_PATH, 'utf8');
  const { cards } = JSON.parse(raw);

  let deck = cards;
  let index = 0;
  let revealed = false;

  const rl = createInterface({ input: stdin, output: stdout });

  while (true) {
    const card = deck[index];
    console.log(`\nVerbum — Nouns (${index + 1}/${deck.length})\n`);
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
