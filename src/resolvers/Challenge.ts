import { plainToClass } from 'class-transformer';
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Directive,
  Field,
  FieldResolver,
  ID,
  InputType,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware
} from 'type-graphql';
import { ChallengeServiceContext } from '../context';
import { Challenge } from '../entities/Challenge';
import { Submission } from '../entities/Submission';
import { SubmissionConnection } from '../entities/SubmissionConnection';
import { Tag } from '../entities/Tag';
import { Wallet } from '../entities/Wallet';
import { MultiWriteProxyHmacGuard } from '../middlewares/MultiWriteProxyHmacGuard';
import {
  NegativeBoostError,
  PostNotAvailable,
  UnauthorizedContentAccessError,
  UpdatingInactiveChallenge,
  UpdatingSolvedChallenge
} from '../utils/exceptions';
import {
  ConnectionInput,
  MwpChallenge_BoostChallengeInput,
  MwpChallenge_MarkChallengeSolvedInput
} from '../utils/inputs';
import {
  MwpChallenge_BoostChallengePayload,
  MwpChallenge_BoostChallengeRollbackPayload,
  MwpChallenge_MarkChallengeSolvedPayload,
  MwpChallenge_MarkChallengeSolvedRollbackPayload,
  MwpChallenge_PublishPayload,
  MwpChallenge_PublishRollbackPayload
} from '../utils/payloads';
import {
  createAbstractPostResolver,
  FindPostArgs
} from './AbstractPostResolver';
import {
  ChallengeConnection,
  ChallengesByTagIdsInput
} from './ChallengeConnection';

const ChallengeBaseResolver = createAbstractPostResolver(
  'Challenge',
  Challenge
);

@InputType()
class MwpChallenge_PublishChallengeInput {
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

  @FieldResolver(() => SubmissionConnection)
  submissions(
    @Root() challenge: Challenge,
    @Arg('input') input: ConnectionInput,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    return SubmissionConnection.connection(input, ctx, {
      challenge
    });
  }

  @Query(() => Challenge, {
    name: `challengeById`
  })
  async findById(
    @Args() args: FindPostArgs,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const challenge = await ctx.em
      .getRepository(Challenge)
      .findOneOrFail(args.id);
    if (!challenge.isActive && !challenge.acceptedSubmission) {
      throw new PostNotAvailable(challenge.id);
    }
    return challenge;
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

  @Directive('@MwpTransaction')
  @UseMiddleware(MultiWriteProxyHmacGuard)
  @Authorized()
  @Mutation(() => MwpChallenge_PublishPayload, {
    name: `mwpChallenge_PublishChallenge`
  })
  async publish2(
    @Arg('payload') payload: MwpChallenge_PublishChallengeInput,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const challenge = await this.getRecordAsOwner(payload.id, ctx);
    challenge.isActive = true;
    challenge.title = payload.title;
    await this.getRepository(ctx).save(challenge);
    return plainToClass(MwpChallenge_PublishPayload, {
      message: `Challenge "${payload}" published`,
      publishedId: challenge.id
    });
  }

  @Directive('@MwpRollback')
  @UseMiddleware(MultiWriteProxyHmacGuard)
  @Authorized()
  @Mutation(() => MwpChallenge_PublishRollbackPayload, {
    name: `mwpChallenge_PublishChallengeRollback`
  })
  async publishRollback(
    @Arg('payload', () => ID) id: string,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const challenge = await this.getRecordAsOwner(id, ctx);
    challenge.isActive = false;
    challenge.title = '';
    await this.getRepository(ctx).save(challenge);
    return plainToClass(MwpChallenge_PublishRollbackPayload, {
      message: `Challenge "${id}" publish rolled back`
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
    if (challenge.acceptedSubmission) {
      throw new UpdatingSolvedChallenge(challenge.id, 'boost');
    }
    if (!challenge.isActive) {
      throw new UpdatingInactiveChallenge(challenge.id);
    }
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
  @Mutation(() => MwpChallenge_BoostChallengeRollbackPayload, {
    name: 'mwpChallenge_BoostChallengeRollback'
  })
  async boostChallengeRollback(
    @Arg('payload') payload: MwpChallenge_BoostChallengeInput,
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

  @Directive('@MwpTransaction')
  @UseMiddleware(MultiWriteProxyHmacGuard)
  @Authorized()
  @Mutation(() => MwpChallenge_MarkChallengeSolvedPayload, {
    name: 'mwpChallenge_MarkChallengeSolved'
  })
  async MarkChallengeSolved(
    @Arg('payload') payload: MwpChallenge_MarkChallengeSolvedInput,
    @Arg('digest') digest: string,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const challenge = await this.getRecordAsOwner(payload.challengeId, ctx);
    const winnerSubmission = await ctx.em
      .getRepository(Submission)
      .findOneOrFail({ id: payload.submissionId, challenge });
    const walletRepo = ctx.em.getRepository(Wallet);
    const winnerWallet = await walletRepo.findOneOrFail(payload.winnerWalletId);
    if (challenge.acceptedSubmission) {
      throw new UpdatingSolvedChallenge(challenge.id, 'mark solved');
    }
    if (!challenge.isActive) {
      throw new UpdatingInactiveChallenge(challenge.id);
    }
    challenge.isActive = false;
    challenge.acceptedSubmission = winnerSubmission;
    await ctx.em.getRepository(Challenge).save(challenge);
    try {
      winnerWallet.score += challenge.boost;
      await walletRepo.save(winnerWallet);
    } catch (e) {
      challenge.isActive = true;
      challenge.acceptedSubmission = null;
      await ctx.em.getRepository(Challenge).save(challenge);
      throw e;
    }
    return plainToClass(MwpChallenge_MarkChallengeSolvedPayload, {
      challenge,
      message: `Challenge "${challenge.id}" marked solved`
    });
  }
  @Directive('@MwpRollback')
  @UseMiddleware(MultiWriteProxyHmacGuard)
  @Authorized()
  @Mutation(() => MwpChallenge_MarkChallengeSolvedRollbackPayload, {
    name: 'mwpChallenge_MarkChallengeSolvedRollback'
  })
  async markChallengeSolvedRollback(
    @Arg('payload') payload: MwpChallenge_MarkChallengeSolvedInput,
    @Arg('digest') digest: string,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const challenge = await this.getRecordAsOwner(payload.challengeId, ctx);
    challenge.isActive = true;
    await ctx.em.getRepository(Challenge).save(challenge);
    return plainToClass(MwpChallenge_MarkChallengeSolvedRollbackPayload, {
      message: `Challenge "${challenge.id}" solved status reverted`
    });
  }
}
