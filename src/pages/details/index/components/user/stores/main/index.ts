import SuspenseQuery from '@lomray/react-mobx-manager/suspense-query';
import axios from 'axios';
import { action, makeObservable, observable } from 'mobx';
import { API_GATEWAY } from '@constants/index';
import type { IApiUser, IUser } from '@interfaces/user';

/**
 * Details user component store
 */
class MainStore {
  /**
   * User
   */
  public user: IUser | null = null;

  /**
   * API request error
   */
  public error: string | null = null;

  /**
   * Indicating request executing
   */
  public isLoading = false;

  /**
   * Suspense service
   */
  public suspense: SuspenseQuery;

  /**
   * @constructor
   */
  constructor() {
    this.suspense = new SuspenseQuery(this);

    makeObservable(this, {
      user: observable,
      error: observable,
      isLoading: observable,
      setUser: action.bound,
      setError: action.bound,
      setIsLoading: action.bound,
    });
  }

  /**
   * Set users
   */
  public setUser(user: IUser): void {
    this.user = user;
  }

  /**
   * Set error
   */
  public setError(error: unknown): void {
    if (error instanceof Error) {
      this.error = error.message;

      return;
    }

    this.error = typeof error === 'string' || error === null ? error : null;
  }

  /**
   * Set loading state
   */
  public setIsLoading(state: boolean): void {
    this.isLoading = state;
  }

  /**
   * Get user
   */
  public getUser = async (id: string): Promise<void> => {
    this.setIsLoading(true);
    this.setError(null);

    try {
      const { data } = await axios.request<{ results: [IApiUser] }>({
        url: `${API_GATEWAY}/?seed=${id}`,
      });

      // add some delay for demonstration
      const time = id === 'user-1' ? 1000 : id === 'user-3' ? 3000 : 2000;

      await new Promise((resolve) => {
        setTimeout(resolve, time);
      });

      const [{ name, email, picture }] = data.results;

      this.setUser({
        id,
        name: Object.values(name).join(' '),
        email,
        avatar: picture.medium,
      });
    } catch (e) {
      this.setError(e);
    }

    this.setIsLoading(false);
  };
}

export default MainStore;
