import type { FC } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface IPlaceholder {
  count?: number;
}

/**
 * Placeholder from user component
 */
const Placeholder: FC<IPlaceholder> = ({ count = 1 }) => (
  <Skeleton count={count} highlightColor="#969696" />
);

export default Placeholder;
