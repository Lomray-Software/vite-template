import { Meta } from '@lomray/react-head-manager';
import ResponseStatus from '@lomray/vite-ssr-boost/components/response-status';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import RouteManager from '@services/route-manager';

interface INotExist {
  status: number;
}

/**
 * Page not exist
 * @constructor
 */
const NotExist: FC<INotExist> = ({ status }) => (
  <>
    <Meta>
      <title>Not found</title>
    </Meta>
    <ResponseStatus status={404} />
    <div>Opps. Page not found. Status: {status}</div>
    <div className="mr20">
      <Link to={RouteManager.makeURL('home')}>Go home</Link>
    </div>
  </>
);

export default NotExist;
