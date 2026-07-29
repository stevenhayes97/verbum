import type { Section } from '../../types/flashcard';
import styles from './SectionNav.module.css';

// About is still a placeholder with no content behind it, so it stays
// disabled — there's nothing to navigate to yet.
const SECTIONS: { id: Section; label: string; enabled: boolean }[] = [
  { id: 'flashcards', label: 'Flashcards', enabled: true },
  { id: 'about', label: 'About', enabled: false },
  { id: 'sentence-practice', label: 'Sentence Practice', enabled: true },
  { id: 'vocab-list', label: 'Vocab List', enabled: true },
  { id: 'favorites', label: 'Favorites', enabled: true },
];

interface SectionNavProps {
  selected: Section;
  onSelect: (section: Section) => void;
}

export function SectionNav({ selected, onSelect }: SectionNavProps) {
  return (
    <nav className={styles.nav}>
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          className={`${styles.item} ${section.id === selected ? styles.active : ''}`}
          disabled={!section.enabled}
          title={section.enabled ? undefined : 'Coming soon'}
          onClick={() => onSelect(section.id)}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
