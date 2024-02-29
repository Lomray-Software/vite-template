import { Meta } from '@lomray/react-head-manager';
import ResponseStatus from '@lomray/vite-ssr-boost/components/response-status';
import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { IS_PROD, WINDOW_OBJ } from '@constants/index';
import RouteManager from '@services/route-manager';

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
    return (
      <>
        <Meta>
          <title>Not found</title>
        </Meta>
        <ResponseStatus status={404} />
        <div>Opps. Page not found. Status: {error.status}</div>
        <div className="mr20">
          <Link to={RouteManager.makeURL('home')}>Go home</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div>Something went wrong.</div>
      {!IS_PROD && <div>Message: {error?.message ?? 'unknown'}</div>}
      {!IS_PROD && <div>Stack: {error?.stack}</div>}
      <div className="mr20">
        <Link to={RouteManager.makeURL('home')}>Go home</Link>
      </div>
    </>
  );
};

export default NotFound;
