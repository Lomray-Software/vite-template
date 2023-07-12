import type { FC } from 'react';
import styles from './styles.module.scss';

/**
 * Default fallback for Suspense
 * @constructor
 */
const Fallback: FC = () => (
  <div className={styles.loadingPane}>
    <h2 className={styles.loader}>🌀</h2>
  </div>
);

export default Fallback;
