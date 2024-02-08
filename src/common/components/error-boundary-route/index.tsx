import { useNavigate, useRouteError } from 'react-router-dom';

/**
 * Error boundary
 */
const ErrorBoundary = () => {
  const navigate = useNavigate();
  const error = useRouteError() as Error;
  const message = (error && error.message) || 'Unknown error';

  return (
    <>
      <div>Boom! Error: {message}</div>
      <div className="mr20">
        <button type="button" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    </>
  );
};

export default ErrorBoundary;
