import { getConnection } from 'typeorm';
import { Config } from './config';
import { ViewCacheService } from './external/ChallengeViewCache';
import { GridFS } from './external/GridFS';

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
  ip: string;
  config: Config;
  gridFileSystem: GridFS;
  viewCache: ViewCacheService;
};
