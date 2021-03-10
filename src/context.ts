import { getConnection } from 'typeorm';
import { Config } from './config';

export type TagServiceContext = {
  em: ReturnType<ReturnType<typeof getConnection>['createEntityManager']>;
  config: Config;
};
