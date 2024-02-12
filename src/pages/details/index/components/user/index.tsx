import { Meta } from '@lomray/react-head-manager';
import { withStores } from '@lomray/react-mobx-manager';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import RouteManager from '@services/route-manager';
import type { StoreProps } from './index.stores';
import stores from './index.stores';
import styles from './styles.module.scss';

interface IUser {
  userId: string;
}

type Props = IUser & StoreProps;

/**
 * Render user data
 * @constructor
 */
const User: FC<Props> = ({ userId, mainStore: { user, suspense, getUser } }) => {
  suspense.query(() => getUser(userId));

  return (
    <>
      {user?.id === 'user-1' && (
        <Meta>
          <title>User: {user?.id}</title>
          <meta name="keywords" content="user" />
        </Meta>
      )}
      <div>
        <span className={styles.col}>User from suspense:</span>{' '}
        <Link to={RouteManager.makeURL('details.user', { id: user!.id })}>
          {user?.id} ({user?.name})
        </Link>
      </div>
    </>
  );
};

const UserWrapper = withStores(User, stores);

export default UserWrapper;
