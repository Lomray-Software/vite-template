import { Meta } from '@lomray/react-head-manager';
import type { FC } from 'react';
import { Link } from 'react-router';

const Home: FC = () => (
  <>
    <Meta>
      <title>Home | TanStack Query SSR example</title>
      <meta
        name="description"
        content="Keep TanStack Query while adding streamed server rendering to a React app."
      />
    </Meta>
    <h1>TanStack Query SSR example</h1>
    <p>Prefetched lists, streamed profiles, and the same query cache in your browser.</p>
    <ul>
      <li>
        <Link to="/deferred">Deferred data</Link>
      </li>
      <li>
        <Link to="/users">Load users before rendering</Link>
      </li>
      <li>
        <Link to="/users/1">Open a user profile</Link>
      </li>
      <li>
        <Link to="/users/999">Try a loader that returns 404</Link>
      </li>
      <li>
        <Link to="/about">Load a page with its own stylesheet</Link>
      </li>
      <li>
        <Link to="/redirect">Follow a server-aware redirect</Link>
      </li>
      <li>
        <Link to="/client-only">Open a browser-only page</Link>
      </li>
      <li>
        <Link to="/missing">Try an unknown route</Link>
      </li>
    </ul>
  </>
);

export default Home;
