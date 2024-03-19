import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { IS_PROD } from '@constants/index';
import RouteManager from '@services/route-manager';

interface IError {
  e?: Error;
}

const Error: FC<IError> = ({ e }) => {
  if (e?.message) {
    console.error('Error boundary:', e);
  }

  return (
    <>
      <div>Something went wrong.</div>
      {!IS_PROD && <div>Message: {e?.message ?? 'unknown'}</div>}
      {!IS_PROD && <div>Stack: {e?.stack}</div>}
      <div className="mr20">
        <Link to={RouteManager.makeURL('home')}>Go home</Link>
      </div>
    </>
  );
};

export default Error;
