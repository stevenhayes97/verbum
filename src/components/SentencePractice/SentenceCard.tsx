import { useEffect, useState } from 'react';
import type { Sentence } from '../../types/flashcard';
import styles from './SentenceCard.module.css';

export function SentenceCard({ sentence }: { sentence: Sentence }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [sentence.id]);

  return (
    <div
      className={styles.scene}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
    >
      <div className={`${styles.inner} ${flipped ? styles.isFlipped : ''}`}>
        <div className={`${styles.face} ${styles.front}`}>{sentence.latin}</div>
        <div className={`${styles.face} ${styles.back}`}>{sentence.english}</div>
      </div>
    </div>
  );
}
