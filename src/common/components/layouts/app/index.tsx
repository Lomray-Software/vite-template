import type { FC } from 'react';
import { Link, Outlet, useNavigation } from 'react-router';

const AppLayout: FC = () => {
  const navigation = useNavigation();

  return (
    <>
      <header>
        <nav aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/users">Users</Link>
          <Link to="/deferred">Deferred data</Link>
          <Link to="/about">About</Link>
          <Link to="/client-only">Client only</Link>
        </nav>
        <p role="status">{navigation.state !== 'idle' ? 'Loading page…' : null}</p>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default AppLayout;
