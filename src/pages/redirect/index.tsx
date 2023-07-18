import Navigate from '@lomray/vite-ssr-boost/components/navigate';
import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import { useEffect, useState } from 'react';
import { IS_SERVER } from '@constants/index';
import RouteManager from '@services/route-manager';

/**
 * Demo page with redirect
 * @constructor
 */
const Redirect: FCRoute = () => {
  const [shouldRedirect, setShouldRedirect] = useState(false);

  /**
   * For client, delay redirect on 2 sec
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRedirect(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    ((IS_SERVER || shouldRedirect) && <Navigate to={RouteManager.makeURL('home')} />) || (
      <div>Wait 2 sec...</div>
    )
  );
};

export default Redirect;
