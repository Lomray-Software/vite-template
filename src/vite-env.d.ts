/// <reference types="vite/client" />

// Augment the browser's existing interface.
// eslint-disable-next-line @typescript-eslint/naming-convention
interface Window {
  __queryFnCalls?: Record<string, number>;
}
