import { Meta } from '@lomray/react-head-manager';
import ResponseStatus from '@lomray/vite-ssr-boost/components/response-status';
import type { FC } from 'react';
import { Link } from 'react-router';

const NotFound: FC = () => (
  <>
    <Meta>
      <title>Not found | Minimal SSR example</title>
      <meta name="description" content="The requested page does not exist." />
    </Meta>
    <ResponseStatus status={404} />
    <h1>Page not found</h1>
    <Link to="/">Go home</Link>
  </>
);

export default NotFound;
