import { withStores } from '@lomray/react-mobx-manager';
import type { FCRoute } from '@lomray/vite-ssr-boost/interfaces/fc-route';
import DefaultSuspense from '@components/default-suspense';
import ErrorBoundary from '@components/error-boundary-route';
import type { StoreProps } from './index.stores';
import stores from './index.stores';

/**
 * Demo page with error boundary
 * @constructor
 */
const ErrorBoundaryPage: FCRoute<StoreProps> = ({ mainStore: { suspense, getUser } }) => {
  suspense.query(() => getUser());

  return <div>This line never be executed.</div>;
};

ErrorBoundaryPage.ErrorBoundary = ErrorBoundary;
ErrorBoundaryPage.Suspense = DefaultSuspense;

const ErrorBoundaryPageWrapper = withStores(ErrorBoundaryPage, stores);

export default ErrorBoundaryPageWrapper;
