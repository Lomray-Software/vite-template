import { Suspense, useId } from '@lomray/consistent-suspense';
import { Meta } from '@lomray/react-head-manager';
import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import { Link, useLoaderData } from 'react-router-dom';
import Fallback from '@components/fallback';
import RouteManager from '@services/route-manager';
import User from './components/user';
// import Navigate from '@lomray/vite-ssr-boost/components/navigate';

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
        Loader user ids: <strong>{userIds.join(', ')}</strong>
      </p>
      {/*{import.meta.env.SSR && <Navigate to="/works" />}*/}
      <div>
        <Suspense fallback={<Fallback />}>
          <>
            <Suspense.NS>
              <User userId="user-1" />
            </Suspense.NS>
            <Suspense.NS>
              <User userId="user-3" />
            </Suspense.NS>
          </>
        </Suspense>
        <Suspense fallback={<Fallback />}>
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
