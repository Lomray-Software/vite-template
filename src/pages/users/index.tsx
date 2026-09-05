import { Meta } from '@lomray/react-head-manager';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData } from 'react-router';
import users from '@data/users';

export const loader = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 300);
  });

  return users;
};

const Users: FC = () => {
  const { t } = useTranslation();
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Meta>
        <title>
          {t('users.heading')} | {t('home.heading')}
        </title>
        <meta name="description" content={t('users.description')} />
      </Meta>
      <h1>{t('users.heading')}</h1>
      <p>{t('users.intro')}</p>
      <ul>
        {data.map((user) => (
          <li key={user.id}>
            <Link to={`/users/${user.id}`}>{user.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Users;
