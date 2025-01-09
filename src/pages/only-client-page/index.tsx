import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import { Link } from 'react-router';
import RouteManager from '@services/route-manager';

/**
 * Demo page: render only on client side
 * @constructor
 */
const OnlyClientPage: FCRoute = () => (
  <>
    <div>
      <div>This page render on on client side</div>
    </div>
    <div className="mr20">
      <Link to={RouteManager.makeURL('home')}>Go back</Link>
    </div>
  </>
);

export default OnlyClientPage;
