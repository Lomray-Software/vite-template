import type { StoresType } from '@lomray/react-mobx-manager';
import MainStore from './stores/main';

const stores = {
  mainStore: MainStore,
};

export type StoreProps = StoresType<typeof stores>;

export default stores;
