import { plainToClass, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsPositive,
  ValidateIf,
  IsMongoId,
  IsUUID
} from 'class-validator';
import { Field, Float, ID, InputType, Int, ObjectType } from 'type-graphql';
import { Between, In, LessThanOrEqual, MoreThan } from 'typeorm';
import { ChallengeServiceContext } from '../context';
import { Challenge } from '../entities/Challenge';

@InputType()
export class ChallengesByTagIdInput {
  @Field(() => Int)
  @IsPositive()
  first!: number;

  @Field(() => ID, {
    nullable: true
  })
  @ValidateIf((o: ChallengesByTagIdsInput) => Boolean(o.afterCursorId))
  @IsMongoId()
  afterCursorId!: string | null;

  @Field(() => Float, {
    nullable: true
  })
  // NOTE should fail only when number is negative (null, undefined and 0 are all accepted)
  @ValidateIf((o: ChallengesByTagIdsInput) => Boolean(o.afterCursorBoost))
  @IsPositive()
  afterCursorBoost!: number | null;

  @Field(() => Int, {
    nullable: true
  })
  @ValidateIf((o: ChallengesByTagIdsInput) => Boolean(o.afterCursorViews))
  @IsPositive()
  afterCursorViews!: number | null;

  @Field()
  shouldPrioritizeBoostedChallenges!: boolean;
}

@InputType()
export class ChallengesByTagIdsInput extends ChallengesByTagIdInput {
  @Field(() => [ID])
  @IsNotEmpty({
    each: true
  })
  @IsUUID(4, {
    each: true
  })
  tags!: string[];
}

@ObjectType()
class ChallengeCursor {
  @Field(() => ID)
  id!: string;

  @Field()
  boost!: number;

  @Field(() => Int)
  views!: number;
}

@ObjectType()
class ChallengeEdge {
  @Type(() => ChallengeCursor)
  @Field(() => ChallengeCursor)
  cursor!: ChallengeCursor;

  @Type(() => Challenge)
  @Field(() => Challenge)
  node!: Challenge;
}

@ObjectType()
class ChallengePageInfo {
  @Field()
  hasNextPage!: boolean;
  @Field()
  hasNextPageBoostedResults!: boolean;
}

@ObjectType()
export class ChallengeConnection {
  @Type(() => ChallengeEdge)
  @Field(() => [ChallengeEdge])
  edges!: ChallengeEdge[];

  @Type(() => ChallengePageInfo)
  @Field(() => ChallengePageInfo)
  pageInfo!: ChallengePageInfo;

  // NOTE unusual to have method here, however wanted to avoid duplicating code as
  // * Field resolver in Tag entity
  // * Query challengesByTags
  static async challengeConnection(
    input: ChallengesByTagIdsInput,
    ctx: ChallengeServiceContext
  ) {
    const challengeRepo = ctx.em.getRepository(Challenge);
    let prioritizedChallenges: Challenge[] = [];
    let standardChallenges: Challenge[] = [];
    if (input.shouldPrioritizeBoostedChallenges) {
      prioritizedChallenges = await challengeRepo.find({
        where: {
          boost: input.afterCursorBoost
            ? Between(0, input.afterCursorBoost)
            : MoreThan(0),
          ...(input.afterCursorId
            ? { id: MoreThan(input.afterCursorId) }
            : undefined),
          tag: In(input.tags)
        },
        take: input.first,
        order: {
          boost: 'DESC'
        }
      });
    }
    if (
      !input.shouldPrioritizeBoostedChallenges ||
      prioritizedChallenges.length < input.first
    ) {
      standardChallenges = await challengeRepo.find({
        where: {
          ...(input.afterCursorViews
            ? { views: LessThanOrEqual(input.afterCursorViews) }
            : undefined),
          ...(input.afterCursorId
            ? { id: MoreThan(input.afterCursorId) }
            : undefined),
          tag: In(input.tags)
        },
        take: input.shouldPrioritizeBoostedChallenges
          ? input.first - prioritizedChallenges.length
          : input.first,
        order: {
          views: 'DESC'
        }
      });
    }
    const allResults = [...prioritizedChallenges, ...standardChallenges];

    let hasNextPage = false;
    let hasNextPageBoostedResults: boolean | null = false;
    if (allResults.length === input.first) {
      const lastElem = allResults[input.first - 1];
      if (input.shouldPrioritizeBoostedChallenges) {
        hasNextPage =
          (await challengeRepo.count(
            lastElem.boost > 0
              ? {
                  where: [
                    {
                      boost: Between(0, lastElem.boost),
                      id: MoreThan(lastElem.id),
                      tag: In(input.tags)
                    },
                    {
                      boost: 0,
                      tag: In(input.tags)
                    }
                  ]
                }
              : {
                  where: {
                    boost: 0,
                    tag: In(input.tags)
                  }
                }
          )) > 0;
      } else {
        hasNextPage =
          (await challengeRepo.count({
            where: {
              views: LessThanOrEqual(lastElem.views),
              id: MoreThan(lastElem.id),
              tag: In(input.tags)
            }
          })) > 0;
        hasNextPageBoostedResults = null;
      }
    }

    const edges = allResults.map((challengeObject) => ({
      cursor: {
        id: challengeObject.id,
        boost: challengeObject.boost,
        views: challengeObject.views
      },
      node: challengeObject
    }));
    const pageInfo = {
      hasNextPage,
      hasNextPageBoostedResults
    };
    return plainToClass(ChallengeConnection, { edges, pageInfo });
  }
}
