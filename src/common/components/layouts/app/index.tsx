import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useNavigation } from 'react-router';
import type { Language } from '@services/localization';

const switchLanguage = (language: Language) => {
  document.cookie = `lang=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.location.reload();
};

const AppLayout: FC = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  return (
    <>
      <header>
        <nav aria-label={t('layout.navigation')}>
          <Link to="/">{t('layout.home')}</Link>
          <Link to="/users">{t('layout.users')}</Link>
          <Link to="/about">{t('layout.about')}</Link>
          <Link to="/client-only">{t('layout.clientOnly')}</Link>
        </nav>
        <nav aria-label={t('layout.language')}>
          <button
            type="button"
            lang="en"
            aria-pressed={i18n.language === 'en'}
            onClick={() => switchLanguage('en')}
          >
            English
          </button>
          <button
            type="button"
            lang="es"
            aria-pressed={i18n.language === 'es'}
            onClick={() => switchLanguage('es')}
          >
            Español
          </button>
        </nav>
        <p role="status">{navigation.state !== 'idle' ? t('layout.loading') : null}</p>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default AppLayout;
