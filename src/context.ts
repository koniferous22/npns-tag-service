import { getConnection } from 'typeorm';
import { Config } from './config';

export type TagServiceContext = {
  em: ReturnType<ReturnType<typeof getConnection>['createEntityManager']>;
  user: {
    data: {
      username: string;
      email: string;
      alias: string;
    };
  } | null;
  config: Config;
};
