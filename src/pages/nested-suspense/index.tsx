import { Suspense } from '@lomray/consistent-suspense';
import { Meta } from '@lomray/react-head-manager';
import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import { Link } from 'react-router-dom';
import Fallback from '@components/fallback';
import RouteManager from '@services/route-manager';
import User from './components/user';

/**
 * Nested suspense demo page
 * @constructor
 */
const NestedSuspense: FCRoute = () => (
  <>
    <Meta>
      <title>Nested suspense</title>
    </Meta>
    <p>Wait until all suspense will be resolved.</p>
    <div>-------</div>
    <Suspense fallback={<Fallback />}>
      <User id="user-1" fields={['id', 'name', 'email']} />
    </Suspense>
    <div>-------</div>
    <Suspense fallback={<Fallback />}>
      <User id="user-2" fields={['id', 'name', 'email']} />
    </Suspense>
    <div>-------</div>
    <div className="mr20">
      <Link to={RouteManager.makeURL('home')}>Go back</Link>
    </div>
  </>
);

export default NestedSuspense;
