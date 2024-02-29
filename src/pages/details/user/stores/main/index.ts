import SuspenseQuery from '@lomray/react-mobx-manager/suspense-query';
import axios from 'axios';
import { action, makeObservable, observable } from 'mobx';
import { API_GATEWAY } from '@constants/index';
import type { IApiUser, IUser } from '@interfaces/user';

/**
 * User detail page store
 */
class MainStore {
  /**
   * User
   */
  public user: IUser | null = null;

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
      setUser: action.bound,
    });
  }

  /**
   * Set users
   */
  public setUser(user: IUser): void {
    this.user = user;
  }

  /**
   * Get user
   */
  public getUser = async (id: string): Promise<void> => {
    const { data } = await axios.request<{ results: [IApiUser] }>({
      url: `${API_GATEWAY}/?seed=${id}`,
    });

    // add some delay
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    const [{ name, email, picture }] = data.results;

    this.setUser({
      id,
      name: Object.values(name).join(' '),
      email,
      avatar: picture.medium,
    });
  };
}

export default MainStore;
