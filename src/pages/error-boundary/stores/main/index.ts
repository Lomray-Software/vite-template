import SuspenseQuery from '@lomray/react-mobx-manager/suspense-query';
import { makeObservable } from 'mobx';

/**
 * Error boundary page store
 */
class MainStore {
  /**
   * Suspense service
   */
  public suspense: SuspenseQuery;

  /**
   * @constructor
   */
  constructor() {
    this.suspense = new SuspenseQuery(this);

    makeObservable(this, {});
  }

  /**
   * Get user
   */
  public getUser = async (): Promise<void> => {
    console.info('Emulate request...');

    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    throw new Error("Ooops. I'm caught error? :)");
  };
}

export default MainStore;
