import { plainToClass } from 'class-transformer';
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  ID,
  InputType,
  Mutation,
  Query,
  Resolver
} from 'type-graphql';
import { ChallengeServiceContext } from '../context';
import { Challenge } from '../entities/Challenge';
import { Tag } from '../entities/Tag';
import { UnauthorizedContentAccessError } from '../utils/exceptions';
import { PublishPayload } from '../utils/payloads';
import { createAbstractPostResolver } from './AbstractPostResolver';
import {
  ChallengeConnection,
  ChallengesByTagIdsInput
} from './ChallengeConnection';

const ChallengeBaseResolver = createAbstractPostResolver(
  'Challenge',
  Challenge
);

@InputType()
class PublishChallengeInput {
  @Field(() => ID, {
    name: 'challengeId'
  })
  id!: string;

  @Field()
  title!: string;
}

@Resolver(() => Challenge)
export class ChallengeResolver extends ChallengeBaseResolver {
  // NOTE just overridden bc of TS, otherwise not necessary
  async getRecordAsOwner(id: string, ctx: ChallengeServiceContext) {
    const post = await ctx.em.getRepository(Challenge).findOneOrFail(id);
    // NOTE Authorized decorator assumed
    if (ctx.user?.data.id !== post.poster.id) {
      // TODO try to implement this as a Decorator
      throw new UnauthorizedContentAccessError(
        'Challenge',
        post.id,
        ctx.user?.data.id
      );
    }
    return post;
  }

  @Query(() => ChallengeConnection)
  async challengesByTagIds(
    @Arg('input') input: ChallengesByTagIdsInput,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    return ChallengeConnection.challengeConnection(input, ctx);
  }

  @Authorized()
  @Mutation(() => Challenge, {
    name: 'postChallenge'
  })
  async post(
    @Arg('tag', () => ID) tagId: string,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const tag = await ctx.em.getRepository(Tag).findOneOrFail(tagId);
    const challengeRepo = ctx.em.getRepository(Challenge);
    const newChallenge = challengeRepo.create({
      tag,
      // NOTE validated by Authorized decorator
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      poster: ctx.user!.data
    });
    await challengeRepo.save(newChallenge);
    return newChallenge;
  }

  @Authorized()
  @Mutation(() => PublishPayload, {
    name: `publishChallenge`
  })
  async publish(
    @Arg('input') input: PublishChallengeInput,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const post = await this.getRecordAsOwner(input.id, ctx);
    post.isActive = true;
    post.title = input.title;
    // NOTE only subclassed entitites are ofc assumed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.getRepository(ctx).save(post as any);
    return plainToClass(PublishPayload, {
      message: `Challenge "${input.id}" published`
    });
  }
}
