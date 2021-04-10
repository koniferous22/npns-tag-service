import { Type } from 'class-transformer';
import { ObjectType, Field, ClassType } from 'type-graphql';
import { AbstractPost } from '../entities/AbstractPost';

export function createEntityPagination<PostT extends AbstractPost>(
  entityName: string,
  entityClass: ClassType<PostT>
) {
  @ObjectType(`${entityName}PageInfo`)
  class PageInfo {
    @Field(() => entityClass)
    hasNextPage!: boolean;
  }

  @ObjectType(`${entityName}Pagination`)
  class Connection {
    @Type(() => entityClass)
    @Field(() => [entityClass])
    entries!: PostT[];

    @Type(() => PageInfo)
    @Field(() => PageInfo)
    pageInfo!: PageInfo;
  }

  return Connection;
}
