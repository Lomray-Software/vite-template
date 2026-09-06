import { Meta } from '@lomray/react-head-manager';
import type { IWorkerPlatform } from '@lomray/vite-ssr-boost/cloudflare';
import { IS_SSR_MODE } from '@lomray/vite-ssr-boost/constants/common';
import type { ISsrRequestContext } from '@lomray/vite-ssr-boost/core/render';
import type { FC } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import readMessage from '@data/message';
import type IWorkerEnv from '@interfaces/worker-env';

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  if (import.meta.env.SSR) {
    const requestContext = context as unknown as ISsrRequestContext;
    const platform = requestContext.executionContext?.platform as
      IWorkerPlatform<IWorkerEnv> | undefined;

    return readMessage(platform?.env);
  }

  if (!IS_SSR_MODE) {
    return readMessage();
  }

  // Data-mode navigation runs loaders in the browser, where bindings are unavailable.
  const response = await fetch('/api/message', { signal: request.signal });

  if (response.status === 404) {
    // Express development and SPA previews have no Worker bindings or API endpoint.
    return readMessage();
  }

  if (!response.ok) {
    throw response;
  }

  return (await response.json()) as Awaited<ReturnType<typeof readMessage>>;
};

const Kv: FC = () => {
  const { message } = useLoaderData<typeof loader>();

  return (
    <>
      <Meta>
        <title>KV message | Minimal SSR example</title>
        <meta
          name="description"
          content="A greeting loaded from a Cloudflare Workers KV binding."
        />
      </Meta>
      <h1>KV message</h1>
      <p>{message}</p>
    </>
  );
};

export default Kv;
