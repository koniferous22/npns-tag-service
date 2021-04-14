import { plainToClass } from 'class-transformer';
import {
  Arg,
  Authorized,
  Ctx,
  Directive,
  Field,
  ID,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware
} from 'type-graphql';
import { ChallengeServiceContext } from '../context';
import { Challenge } from '../entities/Challenge';
import { Tag } from '../entities/Tag';
import { Wallet } from '../entities/Wallet';
import { MultiWriteProxyHmacGuard } from '../middlewares/MultiWriteProxyHmacGuard';
import { NegativeBoostError, UnauthorizedContentAccessError } from '../utils/exceptions';
import { MwpChallenge_BoostChallengeInput } from '../utils/inputs';
import { MwpChallenge_BoostChallengePayload, MwpChallenge_BoostChallengeRollbackPayload, PublishPayload } from '../utils/payloads';
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

  @Directive('@MwpTransaction')
  @UseMiddleware(MultiWriteProxyHmacGuard)
  @Authorized()
  @Mutation(() => MwpChallenge_BoostChallengePayload, {
    name: 'mwpChallenge_BoostChallenge'
  })
  async boostChallenge(
    @Arg('payload') payload: MwpChallenge_BoostChallengeInput,
    @Arg('digest') digest: string,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const challenge = await this.getRecordAsOwner(payload.challengeId, ctx);
    challenge.boost += payload.amount;
    await ctx.em.getRepository(Challenge).save(challenge);
    return plainToClass(MwpChallenge_BoostChallengePayload, {
      challenge,
      message: `Challenge "${challenge.id}" boosted by ${payload.amount}`
    });
  }
  @Directive('@MwpRollback')
  @UseMiddleware(MultiWriteProxyHmacGuard)
  @Authorized()
  @Mutation(() => MwpChallenge_BoostChallengePayload, {
    name: 'mwpChallenge_BoostChallengeRollback'
  })
  async boostChallengeRollback(
    @Arg('payload', () => ID) payload: MwpChallenge_BoostChallengeInput,
    @Arg('digest') digest: string,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const challenge = await this.getRecordAsOwner(payload.challengeId, ctx);
    challenge.boost -= payload.amount;
    if (challenge.boost < 0) {
      throw new NegativeBoostError(challenge.id, challenge.boost);
    }
    await ctx.em.getRepository(Challenge).save(challenge);
    return plainToClass(MwpChallenge_BoostChallengeRollbackPayload, {
      message: `Challenge "${challenge.id}" boosted by ${payload.amount}`
    });
  }
}
