import { Meta } from '@lomray/react-head-manager';
import ResponseStatus from '@lomray/vite-ssr-boost/components/response-status';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

const NotFound: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Meta>
        <title>
          {t('notFound.heading')} | {t('home.heading')}
        </title>
        <meta name="description" content={t('notFound.description')} />
      </Meta>
      <ResponseStatus status={404} />
      <h1>{t('notFound.heading')}</h1>
      <Link to="/">{t('notFound.home')}</Link>
    </>
  );
};

export default NotFound;
