import { Suspense } from '@lomray/consistent-suspense';
import type { FC, PropsWithChildren } from 'react';
import Fallback from '@components/fallback';

/**
 * Default suspense with default fallback
 */
const DefaultSuspense: FC<PropsWithChildren> = ({ children }) => (
  <Suspense fallback={<Fallback />}>{children}</Suspense>
);

export default DefaultSuspense;
