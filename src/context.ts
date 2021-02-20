import { getConnection } from 'typeorm';

export type TagServiceContext = {
  em: ReturnType<ReturnType<typeof getConnection>['createEntityManager']>;
};
