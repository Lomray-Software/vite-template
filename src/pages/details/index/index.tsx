import { Suspense, useId } from '@lomray/consistent-suspense';
import { Meta } from '@lomray/react-head-manager';
import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import { Link, useLoaderData } from 'react-router-dom';
import RouteManager from '@services/route-manager';
import UserPlaceholder from './components/placeholder';
import User from './components/user';

interface ILoaderData {
  userIds: string[];
}

const Details: FCRoute = () => {
  const { userIds } = useLoaderData() as ILoaderData;
  const id1 = useId();
  const id2 = useId();

  return (
    <>
      <Meta>
        <title>Details page</title>
        <meta name="description" content="Details page" />
        <body data-id={id1} style={{ border: '5px' }} />
      </Meta>
      <p style={{ border: '1px' }}>
        This is about page. Stable ids: <strong>{id1}</strong> and <strong>{id2}</strong>
      </p>
      <p>
        Load users for id's: <strong>{userIds.join(', ')}</strong>
      </p>
      <div>
        <Suspense fallback={<UserPlaceholder count={2} />}>
          <>
            <Suspense.NS>
              <User userId="user-1" />
            </Suspense.NS>
            <Suspense.NS>
              <User userId="user-3" />
            </Suspense.NS>
          </>
        </Suspense>
        <Suspense fallback={<UserPlaceholder />}>
          <User userId="user-2" />
        </Suspense>
      </div>
      <div className="mr20">
        <Link to={RouteManager.makeURL('home')}>Go back</Link>
      </div>
    </>
  );
};

/**
 * Just example
 */
Details.loader = (): ILoaderData => {
  const userIds = ['user-1', 'user-2', 'user-3'];

  return { userIds };
};

export default Details;
