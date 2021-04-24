import { plainToClass, Type } from 'class-transformer';
import { ClassType, Field, ObjectType } from 'type-graphql';
import { FindConditions } from 'typeorm';
import { ChallengeServiceContext } from '../context';

export function createAbstractConnection<
  EntityT,
  CursorT,
  InputT extends Partial<CursorT> & { first: number }
>(
  entityClass: ClassType<EntityT>,
  entityName: string,
  cursorClass: ClassType<CursorT>,
  order: { [key in keyof EntityT]?: 'ASC' | 'DESC' },
  getCursorDataFromEntity: (instance: EntityT) => CursorT,
  getPredicateFromCursorFields: (
    cursor: Partial<CursorT>
  ) => FindConditions<EntityT>
) {
  @ObjectType(`${entityName}Cursor`)
  @ObjectType(`${entityName}PageInfo`)
  class PageInfo {
    @Field()
    hasNextPage!: boolean;
  }

  @ObjectType(`${entityName}Edge`)
  class Edge {
    @Field(() => cursorClass)
    cursor!: CursorT;

    @Field(() => entityClass)
    node!: EntityT;
  }

  @ObjectType(`${entityName}Connection`)
  class Connection {
    @Type(() => Edge)
    @Field(() => [Edge])
    edges!: Edge[];

    @Type(() => PageInfo)
    @Field(() => PageInfo)
    pageInfo!: PageInfo;

    static async connection(
      input: InputT,
      ctx: ChallengeServiceContext,
      where: FindConditions<EntityT>
    ) {
      const repo = ctx.em.getRepository(entityClass);
      const records = await repo.find({
        where: {
          ...where,
          ...getPredicateFromCursorFields(input)
        },
        take: input.first,
        order
      });
      let hasNextPage = false;
      if (records.length === input.first) {
        const lastElem = records[input.first - 1];
        hasNextPage =
          (await repo.count({
            where: {
              ...where,
              ...getPredicateFromCursorFields(getCursorDataFromEntity(lastElem))
            }
          })) > 0;
      }
      const edges = records.map((obj) => ({
        cursor: getCursorDataFromEntity(obj),
        node: obj
      }));
      const pageInfo = {
        hasNextPage
      };
      return plainToClass(Connection, { edges, pageInfo });
    }
  }
  return Connection;
}
