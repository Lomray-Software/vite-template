import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import { Link } from 'react-router-dom';
import RouteManager from '@services/route-manager.ts';
import styles from './styles.module.scss';

/**
 * Demo page with no lazy import
 * @constructor
 */
const NotLazy: FCRoute = () => (
  <>
    <div className={styles.container}>
      <p className={styles.text}>Styled text</p>
    </div>
    <div className="mr20">
      <Link to={RouteManager.makeURL('home')}>Go back</Link>
    </div>
  </>
);

export default NotLazy;
