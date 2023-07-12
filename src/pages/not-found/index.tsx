import { Meta } from '@lomray/react-head-manager';
import ResponseStatus from '@lomray/vite-ssr-boost/components/response-status';
import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { IS_PROD } from '@constants/index';
import Router from '@services/router';

/**
 * Not found page
 * @constructor
 */
const NotFound: FCRoute = () => {
  const error = useRouteError() as Error;

  if (isRouteErrorResponse(error)) {
    return (
      <>
        <Meta>
          <title>Not found</title>
        </Meta>
        <ResponseStatus status={404} />
        <div>Opps. Page not found. Status: {error.status}</div>
        <div className="mr20">
          <Link to={Router.makeURL('home')}>Go home</Link>
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
        <Link to={Router.makeURL('home')}>Go home</Link>
      </div>
    </>
  );
};

export default NotFound;
