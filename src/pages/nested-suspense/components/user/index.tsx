import { Suspense } from '@lomray/consistent-suspense';
import { withStores } from '@lomray/react-mobx-manager';
import type { FC } from 'react';
import { useMemo } from 'react';
import Fallback from '@components/fallback';
import type { IUser as IUserEntity } from '@interfaces/user';
import type { StoreProps } from './index.stores';
import stores from './index.stores';

interface IUser {
  id: string;
  fields?: (keyof IUserEntity)[];
}

type TProps = IUser & StoreProps;

/**
 * Render user profile field
 * @constructor
 */
const User: FC<TProps> = ({ id, fields, mainStore: { user, suspense, getUser } }) => {
  const [field, ...restFields] = fields ?? [];

  if (!field) {
    return null;
  }

  // get value user filed from API
  suspense.query(() => getUser(id, field));

  /**
   * WARNING: Nested Suspense should be memorized for preventing:
   * "This Suspense boundary received an update before it finished hydrating."
   */
  const children = useMemo(
    () => (
      <Suspense fallback={<Fallback />}>
        <UserWrapper id={id} fields={restFields} />
      </Suspense>
    ),
    [id],
  );

  return (
    <div style={{ paddingLeft: '50px', textAlign: 'left' }}>
      <p>
        <strong>{field}:</strong> {user?.[field]}
      </p>
      {children}
    </div>
  );
};

const UserWrapper = withStores(User, stores);

export default UserWrapper;
