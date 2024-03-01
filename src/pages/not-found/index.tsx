import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { WINDOW_OBJ } from '@constants/index';
import Error from './components/error';
import NotExist from './components/not-exist';

/**
 * Not found page
 * @constructor
 */
const NotFound: FCRoute = () => {
  const error = useRouteError() as Error;

  /**
   * Reload page when page isn't loaded (ex. happens when chunks names different)
   */
  if (
    WINDOW_OBJ &&
    (error?.message?.startsWith('Failed to fetch dynamically imported module') ||
      error?.message?.startsWith('Unable to preload') ||
      error?.message?.includes('Importing a module script failed'))
  ) {
    console.error('Failed to fetch dynamically imported module #1.', error);

    // eslint-disable-next-line no-self-assign
    WINDOW_OBJ.location.href = WINDOW_OBJ.location.href;

    return null;
  }

  if (isRouteErrorResponse(error)) {
    return <NotExist status={error.status} />;
  }

  return <Error e={error} />;
};

export default NotFound;
