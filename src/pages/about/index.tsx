import { Meta } from '@lomray/react-head-manager';
import type { FC } from 'react';
import styles from './styles.module.css';

// eslint-disable-next-line import-x/prefer-default-export -- React Router lazy routes use this named export.
export const Component: FC = () => (
  <>
    <Meta>
      <title>About | Minimal SSR example</title>
      <meta
        name="description"
        content="A lazy route with its own CSS module, included in server-rendered HTML."
      />
    </Meta>
    <h1>About this example</h1>
    <p className={styles.note}>
      This page is a lazy route. Its stylesheet is included in the server-rendered document.
    </p>
  </>
);
