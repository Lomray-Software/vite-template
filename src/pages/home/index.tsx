import { Meta } from '@lomray/react-head-manager';
import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import ReactLogoImg from '@assets/images/react.svg';
import { APP_VERSION, IS_PROD } from '@constants/index';
import RouteManager from '@services/route-manager';
import styles from './styles.module.scss';

interface ILoaderData {
  isDefaultCrawler: boolean;
}

/**
 * Home page
 * @constructor
 */
const Home: FCRoute = () => {
  const { isDefaultCrawler } = useLoaderData() as ILoaderData;
  const [isCrawler, setIsCrawler] = useState(isDefaultCrawler);

  // show only on deployed application
  const hasVersion = IS_PROD && !APP_VERSION.startsWith('APP_');

  /**
   * Enable/disable stream for demo
   */
  const toggleCrawler = () => {
    const nextVal = isCrawler ? '0' : '1';

    setIsCrawler(nextVal === '1');
    Cookies.set('isCrawler', nextVal);
  };

  return (
    <>
      <Meta>
        <title>Home page</title>
        <meta name="description" content="Home page" />
      </Meta>
      <div>SPA, SSR, Mobx, Consistent Suspense, Meta tags</div>
      {hasVersion && (
        <div>
          Version: <strong>{APP_VERSION}</strong>
        </div>
      )}
      <div>
        <a href="https://vitejs.dev/" target="_blank">
          <img src="/vite.svg" className={styles.logo} width="145" height="145" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img
            src={ReactLogoImg}
            className={styles.logo}
            width="145"
            height="145"
            alt="React logo"
          />
        </a>
      </div>
      <div className={styles.card}>
        <button onClick={toggleCrawler}>
          You are watching site like: <strong>{isCrawler ? 'Search bot' : 'Human'}</strong>
        </button>
        <p>
          <Link to={RouteManager.makeURL('details')}>How to works Suspense?</Link>
        </p>
        <p>
          <Link to={RouteManager.makeURL('errorBoundary')}>Investigate error boundary.</Link>
        </p>
        <p>
          <Link to={RouteManager.makeURL('nestedSuspense')}>What about nested Suspense?</Link>
        </p>
        <p>
          <Link to={RouteManager.makeURL('redirect')}>Redirect demo</Link>
        </p>
      </div>
      <p className={styles.navigateExplain}>Click on the links to learn more</p>
      <p className={styles.navigateExplain}>
        <a href="https://github.com/Lomray-Software/vite-template" target="_blank" rel="nofollow">
          Open repository
        </a>
      </p>
    </>
  );
};

Home.loader = ({ request }): ILoaderData => {
  const isDefaultCrawler =
    request.headers.get('cookie')?.includes('isCrawler=1') ?? Cookies.get('isCrawler') === '1';

  return {
    isDefaultCrawler,
  };
};

export default Home;
