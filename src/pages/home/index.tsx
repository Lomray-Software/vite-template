import { Meta } from '@lomray/react-head-manager';
import type { FC } from 'react';
import { Link } from 'react-router';

const Home: FC = () => (
  <>
    <Meta>
      <title>Home | Minimal SSR example</title>
      <meta
        name="description"
        content="A minimal React app with server rendering and route loaders."
      />
    </Meta>
    <h1>Minimal SSR example</h1>
    <p>React routes, server-rendered HTML, and the same app in your browser.</p>
    <ul>
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
