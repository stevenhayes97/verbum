import styles from './About.module.css';

export function About() {
  return (
    <div className={styles.panel}>
      <p>
        Verbum is a Latin vocabulary and grammar trainer - flashcards, sentence
        practice, a vocab list, and declension tables, all in one place for
        working through Latin a bit at a time.
      </p>
      <p>
        Built by Steven Hayes, with Claude Code and Cursor doing a lot of the
        typing.
      </p>
    </div>
  );
}
