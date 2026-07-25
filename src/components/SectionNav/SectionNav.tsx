import styles from './SectionNav.module.css';

// About and Sentence Practice are placeholders with no content behind them
// yet, so they're disabled — there's nothing to navigate to. Section state /
// routing gets added when one of them has something to show.
const SECTIONS = [
  { id: 'flashcards', label: 'Flashcards', enabled: true },
  { id: 'about', label: 'About', enabled: false },
  { id: 'sentence-practice', label: 'Sentence Practice', enabled: false },
];

export function SectionNav() {
  return (
    <nav className={styles.nav}>
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          className={`${styles.item} ${section.enabled ? styles.active : ''}`}
          disabled={!section.enabled}
          title={section.enabled ? undefined : 'Coming soon'}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
