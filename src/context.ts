import { getConnection } from 'typeorm';
import { Config } from './config';

export type ChallengeServiceContext = {
  em: ReturnType<ReturnType<typeof getConnection>['createEntityManager']>;
  user: {
    data: {
      id: string;
      createdAt: string;
      updatedAt: string;
      username: string;
      email: string;
      alias: null | string;
      hasNsfwAllowed: boolean;
    };
  } | null;
  config: Config;
};
