import { Meta } from '@lomray/react-head-manager';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

// eslint-disable-next-line import-x/prefer-default-export -- React Router lazy routes use this named export.
export const Component: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Meta>
        <title>
          {t('about.heading')} | {t('home.heading')}
        </title>
        <meta name="description" content={t('about.description')} />
      </Meta>
      <h1>{t('about.heading')}</h1>
      <p className={styles.note}>{t('about.intro')}</p>
    </>
  );
};
