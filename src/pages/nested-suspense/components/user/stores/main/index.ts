import SuspenseQuery from '@lomray/react-mobx-manager/suspense-query';
import axios from 'axios';
import { makeObservable, observable, runInAction } from 'mobx';
import { API_GATEWAY } from '@constants/index';
import type { IApiUser, IUser } from '@interfaces/user';

/**
 * User detail store
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
    });
  }

  /**
   * Get user
   */
  public getUser = async (id: string, field: keyof IUser): Promise<void> => {
    const { data } = await axios.request<{ results: [IApiUser] }>({
      url: `${API_GATEWAY}/?seed=${id}`,
    });

    // add some delay
    await new Promise((resolve) => {
      setTimeout(resolve, id === 'user-1' ? 2000 : 1500);
    });

    const [{ name, email }] = data.results;

    runInAction(() => {
      const user = {
        id,
        name: Object.values(name).join(' '),
        email,
        avatar: '',
      };

      this.user = { [field]: user[field] } as unknown as IUser;
    });
  };
}

export default MainStore;
