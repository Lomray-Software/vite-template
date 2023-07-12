import { Meta } from '@lomray/react-head-manager';
import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactLogoImg from '@assets/images/react.svg';
import Router from '@services/router';
import styles from './styles.module.scss';

/**
 * Home page
 * @constructor
 */
const Home: FCRoute = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <Meta>
        <title>Home page</title>
        <meta name="description" content="Home page" />
      </Meta>
      <div>SPA, SSR, Mobx, Consistent Suspense, Meta tags</div>
      <div>
        <a href="https://vitejs.dev/" target="_blank">
          <img src="/vite.svg" className={styles.logo} alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={ReactLogoImg} className={styles.logo} alt="React logo" />
        </a>
      </div>
      <div className={styles.card}>
        <button onClick={() => setCount((c) => c + 1)}>count is {count}</button>
        <p>
          <Link to={Router.makeURL('details')}>How to works Suspense?</Link>
        </p>
        <p>
          <Link to={Router.makeURL('errorBoundary')}>Investigate error boundary.</Link>
        </p>
        <p>
          <Link to={Router.makeURL('nestedSuspense')}>What about nested Suspense?</Link>
        </p>
      </div>
      <p className={styles.navigateExplain}>Click on the links to learn more</p>
    </>
  );
};

export default Home;
