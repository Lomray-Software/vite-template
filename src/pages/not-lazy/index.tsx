import { Suspense } from '@lomray/consistent-suspense';
import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import { lazy } from 'react';
import { Link } from 'react-router-dom';
import Fallback from '@components/fallback';
import RouteManager from '@services/route-manager';
import styles from './styles.module.scss';

const CodeSplitting = lazy(() => import('@components/code-splitting'));

/**
 * Demo page with no lazy import
 * @constructor
 */
const NotLazy: FCRoute = () => (
  <>
    <div className={styles.container}>
      <div className={styles.text}>Styled text</div>
      <div>
        <Suspense fallback={<Fallback />}>
          <CodeSplitting />
        </Suspense>
      </div>
    </div>
    <div className="mr20">
      <Link to={RouteManager.makeURL('home')}>Go back</Link>
    </div>
  </>
);

export default NotLazy;
