// Latin orthography helpers. See the "Spelling Conventions" section of
// README.md for the macron rules the data is written against.

// Combining macron (U+0304) -- what NFD decomposition leaves behind once
// a precomposed vowel like "ā" (U+0101) is split into "a" + the mark.
const COMBINING_MACRON = /̄/g;

/**
 * Strips macrons so Latin can be compared without them: foldMacrons('rēx')
 * === 'rex'. Vowel length is meaningful to read but a nuisance to type on a
 * laptop keyboard, so anywhere the user types Latin folds both sides rather
 * than demanding the macrons back.
 *
 * NFD splits each precomposed vowel into base letter + combining mark, the
 * replace drops the mark, and NFC recomposes anything else that decomposed
 * along the way.
 */
export function foldMacrons(text: string): string {
  return text.normalize('NFD').replace(COMBINING_MACRON, '').normalize('NFC');
}
