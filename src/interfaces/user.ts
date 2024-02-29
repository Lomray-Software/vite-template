export interface IUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface IApiUser {
  name: Record<string, string>;
  email: string;
  picture: {
    medium: string;
  };
}
