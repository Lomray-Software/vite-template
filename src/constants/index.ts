export const IS_SERVER = import.meta.env.SSR;

export const IS_CLIENT = typeof window !== 'undefined';

export const IS_PROD = import.meta.env.MODE === 'production';

export const API_GATEWAY = import.meta.env.VITE_API_GATEWAY;
