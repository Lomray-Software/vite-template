import type IWorkerEnv from '@interfaces/worker-env';

const readMessage = async (env?: IWorkerEnv) => ({
  message: (await env?.MESSAGES.get('greeting')) ?? 'No greeting in KV yet.',
});

export default readMessage;
