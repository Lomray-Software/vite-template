import { Meta } from '@lomray/react-head-manager';
import { withStores } from '@lomray/react-mobx-manager';
import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import { Link, useParams } from 'react-router-dom';
import DefaultSuspense from '@components/default-suspense';
import ErrorBoundary from '@components/error-boundary-route';
import RouteManager from '@services/route-manager';
import type { StoreProps } from './index.stores';
import stores from './index.stores';
import styles from './styles.module.scss';

/**
 * Detail user page
 * @constructor
 */
const User: FCRoute<StoreProps> = ({ mainStore: { user, suspense, getUser } }) => {
  const { id } = useParams<{ id: string }>();

  suspense.query(() => getUser(id!));

  return (
    <>
      <Meta>
        <title>User {user?.name}</title>
        <meta name="description" content={`User description ${user!.name}`} />
      </Meta>
      <div>
        <p>Id: {user?.id}</p>
        <p>Name: {user?.name}</p>
        <p>Email: {user?.email}</p>
        <p>
          Avatar: <img src={user?.avatar} className={styles.avatar} alt="User avatar" />
        </p>
      </div>
      <div className="mr20">
        <Link to={RouteManager.makeURL('details')}>Go back</Link>
      </div>
    </>
  );
};

User.ErrorBoundary = ErrorBoundary;
User.Suspense = DefaultSuspense;

const UserWrapper = withStores(User, stores);

export default UserWrapper;
