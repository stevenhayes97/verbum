import { DECLENSION_TABLES } from '../../data/declensionTables';
import styles from './DeclensionTables.module.css';

export function DeclensionTables() {
  return (
    <div className={styles.listWrap}>
      {DECLENSION_TABLES.map((table) => (
        <div key={table.id} className={styles.group}>
          <h2 className={styles.groupTitle}>{table.title}</h2>
          <p className={styles.example}>
            {table.example} ({table.gender})
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Case</th>
                <th>Singular</th>
                <th>Plural</th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row.case}>
                  <td>{row.case}</td>
                  <td>{row.singular}</td>
                  <td>{row.plural}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {table.note && <p className={styles.note}>{table.note}</p>}
        </div>
      ))}
    </div>
  );
}
