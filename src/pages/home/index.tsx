import { Meta } from '@lomray/react-head-manager';
import { IS_SSR_MODE } from '@lomray/vite-ssr-boost/constants/common';
import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import cn from 'classnames';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData } from 'react-router-dom';
import ReactLogoImg from '@assets/images/react.svg';
import { APP_VERSION, IS_PROD } from '@constants/index';
import { getTranslation } from '@services/localization';
import RouteManager from '@services/route-manager';
import styles from './styles.module.scss';

interface ILoaderData {
  isDefaultCrawler: boolean;
  localizedStr: string;
}

/**
 * Home page
 * @constructor
 */
const Home: FCRoute = () => {
  const { t } = useTranslation(['translation']);
  const { isDefaultCrawler, localizedStr } = useLoaderData() as ILoaderData;
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
      <div>Localized output: {t('translation:checkIt')}</div>
      <div>Localized output loader: {localizedStr}</div>
      <div>
        {hasVersion && (
          <p>
            Version: <strong>{APP_VERSION}</strong>
          </p>
        )}
        <p>Type: {IS_SSR_MODE ? 'SSR' : 'SPA'}</p>
      </div>
      <div className={styles.logos}>
        <a href="https://vitejs.dev/" target="_blank" rel="nofollow">
          <img src="/vite.svg" className={styles.logo} alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="nofollow">
          <img src={ReactLogoImg} className={styles.logo} alt="React logo" />
        </a>
        <a href="https://github.com/Lomray-Software/vite-ssr-boost" target="_blank">
          <img
            src="https://raw.githubusercontent.com/Lomray-Software/vite-ssr-boost/prod/logo.png"
            className={cn(styles.logo, styles.logoBoost)}
            alt="SSR Boost logo"
          />
        </a>
        <a href="https://github.com/Lomray-Software/react-mobx-manager" target="_blank">
          <img
            src="https://raw.githubusercontent.com/Lomray-Software/react-mobx-manager/prod/logo.png"
            className={cn(styles.logo, styles.logoBoost)}
            alt="Mobx Store Manager logo"
          />
        </a>
      </div>
      <div className={styles.card}>
        <button type="button" onClick={toggleCrawler}>
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
        <p>
          <Link to={RouteManager.makeURL('notLazy')}>Not lazy page demo</Link>
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

Home.loader = async ({ request }): Promise<ILoaderData> => {
  const t = await getTranslation(['forms']);
  const isDefaultCrawler =
    request.headers.get('cookie')?.includes('isCrawler=1') ?? Cookies.get('isCrawler') === '1';
  const localizedStr = t('forms:firstName');

  return {
    isDefaultCrawler,
    localizedStr,
  };
};

export default Home;
