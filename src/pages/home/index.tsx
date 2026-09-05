import { Meta } from '@lomray/react-head-manager';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

const Home: FC = () => {
  const { t } = useTranslation();
  const heading = t('home.heading');

  return (
    <>
      <Meta>
        <title>{heading}</title>
        <meta name="description" content={t('home.description')} />
      </Meta>
      <h1>{heading}</h1>
      <p>{t('checkIt')}</p>
      <p>{t('home.intro')}</p>
      <ul>
        <li>
          <Link to="/users">{t('home.users')}</Link>
        </li>
        <li>
          <Link to="/users/1">{t('home.profile')}</Link>
        </li>
        <li>
          <Link to="/users/999">{t('home.loaderError')}</Link>
        </li>
        <li>
          <Link to="/about">{t('home.about')}</Link>
        </li>
        <li>
          <Link to="/redirect">{t('home.redirect')}</Link>
        </li>
        <li>
          <Link to="/client-only">{t('home.clientOnly')}</Link>
        </li>
        <li>
          <Link to="/missing">{t('home.missing')}</Link>
        </li>
      </ul>
    </>
  );
};

export default Home;
