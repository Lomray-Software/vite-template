export const IS_SERVER = import.meta.env.SSR;

export const IS_CLIENT = !IS_SERVER;

export const IS_PROD = import.meta.env.MODE === 'production';

export const WINDOW_OBJ = (typeof window !== 'undefined' ? window : {}) as Window;

export const API_GATEWAY = import.meta.env.VITE_API_GATEWAY;

// will be replaced in github workflows
export const APP_VERSION = 'APP_VERSION';
