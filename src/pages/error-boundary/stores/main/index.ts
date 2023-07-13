import SuspenseQuery from '@lomray/react-mobx-manager/suspense-query';

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
  }

  /**
   * Get user
   */
  public getUser = async (): Promise<void> => {
    // add some delay
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    throw new Error("Ooops. I'm caught error? :)");
  };
}

export default MainStore;
