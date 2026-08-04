import { useEffect, useState } from 'react';
import type { Sentence, SentenceDirection } from '../../types/flashcard';
import styles from './SentenceCard.module.css';

interface SentenceCardProps {
  sentence: Sentence;
  direction: SentenceDirection;
}

export function SentenceCard({ sentence, direction }: SentenceCardProps) {
  const [flipped, setFlipped] = useState(false);
  const latinFirst = direction === 'la-en';

  // Resets on a direction change as well as a card change, so flipping to
  // the other direction never lands you on a face showing the answer.
  useEffect(() => {
    setFlipped(false);
  }, [sentence.id, direction]);

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
        <div className={`${styles.face} ${styles.front} ${latinFirst ? styles.latin : styles.english}`}>
          {latinFirst ? sentence.latin : sentence.english}
        </div>
        <div className={`${styles.face} ${styles.back} ${latinFirst ? styles.english : styles.latin}`}>
          {latinFirst ? sentence.english : sentence.latin}
        </div>
      </div>
    </div>
  );
}
