// Static grammar reference data (not user vocab), so unlike public/data/*.json
// this ships as a hard-coded TS module: fixed content, no fetch/loading state,
// not subject to the append-only or wipe-and-regenerate lifecycles documented
// in CLAUDE.md for the vocab/favorites/sentences JSON files.

export type DeclensionCase = 'Nominative' | 'Genitive' | 'Dative' | 'Accusative' | 'Ablative' | 'Vocative';

export interface DeclensionCaseRow {
  case: DeclensionCase;
  singular: string;
  plural: string;
}

export interface DeclensionTable {
  id: string;
  title: string;
  example: string;
  gender: string;
  rows: DeclensionCaseRow[];
  note?: string;
}

export const DECLENSION_TABLES: DeclensionTable[] = [
  {
    id: '1st',
    title: '1st Declension',
    example: 'puella, puellae',
    gender: 'Feminine',
    rows: [
      { case: 'Nominative', singular: '-a', plural: '-ae' },
      { case: 'Genitive', singular: '-ae', plural: '-ārum' },
      { case: 'Dative', singular: '-ae', plural: '-is' },
      { case: 'Accusative', singular: '-am', plural: '-ās' },
      { case: 'Ablative', singular: '-ā', plural: '-is' },
      { case: 'Vocative', singular: '-a', plural: '-ae' },
    ],
  },
  {
    id: '2nd-us',
    title: '2nd Declension — dominus pattern',
    example: 'dominus, dominī',
    gender: 'Masculine',
    rows: [
      { case: 'Nominative', singular: '-us', plural: '-ī' },
      { case: 'Genitive', singular: '-ī', plural: '-ōrum' },
      { case: 'Dative', singular: '-ō', plural: '-īs' },
      { case: 'Accusative', singular: '-um', plural: '-ōs' },
      { case: 'Ablative', singular: '-ō', plural: '-īs' },
      { case: 'Vocative', singular: '-e', plural: '-ī' },
    ],
    note: 'The vocative singular (-e, e.g. "domine") is the one place -us nouns diverge from the nominative.',
  },
  {
    id: '2nd-er',
    title: '2nd Declension — liber pattern',
    example: 'liber, librī',
    gender: 'Masculine',
    rows: [
      { case: 'Nominative', singular: 'liber', plural: 'librī' },
      { case: 'Genitive', singular: 'librī', plural: 'librōrum' },
      { case: 'Dative', singular: 'librō', plural: 'librīs' },
      { case: 'Accusative', singular: 'librum', plural: 'librōs' },
      { case: 'Ablative', singular: 'librō', plural: 'librīs' },
      { case: 'Vocative', singular: 'liber', plural: 'librī' },
    ],
    note: 'Unlike -us nouns, the vocative singular equals the nominative. Some -er nouns keep the e throughout (puer, puerī) instead of dropping it like liber, librī.',
  },
  {
    id: '2nd-neuter',
    title: '2nd Declension — Neuter',
    example: 'bellum, bellī',
    gender: 'Neuter',
    rows: [
      { case: 'Nominative', singular: '-um', plural: '-a' },
      { case: 'Genitive', singular: '-ī', plural: '-ōrum' },
      { case: 'Dative', singular: '-ō', plural: '-īs' },
      { case: 'Accusative', singular: '-um', plural: '-a' },
      { case: 'Ablative', singular: '-ō', plural: '-īs' },
      { case: 'Vocative', singular: '-um', plural: '-a' },
    ],
  },
  {
    id: '3rd',
    title: '3rd Declension',
    example: 'rēx, rēgis',
    gender: 'Masculine / Feminine',
    rows: [
      { case: 'Nominative', singular: '(varies)', plural: '-ēs' },
      { case: 'Genitive', singular: '-is', plural: '-um' },
      { case: 'Dative', singular: '-ī', plural: '-ibus' },
      { case: 'Accusative', singular: '-em', plural: '-ēs' },
      { case: 'Ablative', singular: '-e', plural: '-ibus' },
      { case: 'Vocative', singular: '(= nom.)', plural: '-ēs' },
    ],
    note: '3rd declension nominative singular has no single predictable ending — it varies by word (rēx, rēgis; cōnsul, cōnsulis; etc.). The genitive stem (here rēg-) is what the other endings attach to.',
  },
  {
    id: '3rd-neuter',
    title: '3rd Declension — Neuter',
    example: 'corpus, corporis',
    gender: 'Neuter',
    rows: [
      { case: 'Nominative', singular: '(varies)', plural: '-a' },
      { case: 'Genitive', singular: '-is', plural: '-um' },
      { case: 'Dative', singular: '-ī', plural: '-ibus' },
      { case: 'Accusative', singular: '(= nom.)', plural: '-a' },
      { case: 'Ablative', singular: '-e', plural: '-ibus' },
      { case: 'Vocative', singular: '(= nom.)', plural: '-a' },
    ],
    note: 'As with all neuters, nominative, accusative, and vocative are identical in both numbers.',
  },
  {
    id: '4th',
    title: '4th Declension',
    example: 'frūctus, frūctūs',
    gender: 'Masculine / Feminine',
    rows: [
      { case: 'Nominative', singular: '-us', plural: '-ūs' },
      { case: 'Genitive', singular: '-ūs', plural: '-uum' },
      { case: 'Dative', singular: '-uī', plural: '-ibus' },
      { case: 'Accusative', singular: '-um', plural: '-ūs' },
      { case: 'Ablative', singular: '-ū', plural: '-ibus' },
      { case: 'Vocative', singular: '-us', plural: '-ūs' },
    ],
  },
  {
    id: '4th-neuter',
    title: '4th Declension — Neuter',
    example: 'cornū, cornūs',
    gender: 'Neuter',
    rows: [
      { case: 'Nominative', singular: '-ū', plural: '-ua' },
      { case: 'Genitive', singular: '-ūs', plural: '-uum' },
      { case: 'Dative', singular: '-ū', plural: '-ibus' },
      { case: 'Accusative', singular: '-ū', plural: '-ua' },
      { case: 'Ablative', singular: '-ū', plural: '-ibus' },
      { case: 'Vocative', singular: '-ū', plural: '-ua' },
    ],
  },
  {
    id: '5th',
    title: '5th Declension',
    example: 'rēs, reī',
    gender: 'Feminine',
    rows: [
      { case: 'Nominative', singular: '-ēs', plural: '-ēs' },
      { case: 'Genitive', singular: '-eī', plural: '-ērum' },
      { case: 'Dative', singular: '-eī', plural: '-ēbus' },
      { case: 'Accusative', singular: '-em', plural: '-ēs' },
      { case: 'Ablative', singular: '-ē', plural: '-ēbus' },
      { case: 'Vocative', singular: '-ēs', plural: '-ēs' },
    ],
  },
];
