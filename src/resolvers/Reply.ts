import { Authorized, Mutation, Arg, ID, Ctx, Resolver } from 'type-graphql';
import { ChallengeServiceContext } from '../context';
import { Reply } from '../entities/Reply';
import { Submission } from '../entities/Submission';
import { createAbstractPostResolver } from './AbstractPostResolver';

const ReplyBaseResolver = createAbstractPostResolver('Reply', Reply);

@Resolver(() => Reply)
export class ReplyResolver extends ReplyBaseResolver {
  @Authorized()
  @Mutation(() => Reply, {
    name: 'postSubmission'
  })
  async post(
    @Arg('submission', () => ID) submissionId: string,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const submission = await ctx.em
      .getRepository(Submission)
      .findOneOrFail(submissionId);
    const replyRepo = ctx.em.getRepository(Reply);
    const newReply = replyRepo.create({
      submission,
      // NOTE validated by Authorized decorator
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      poster: ctx.user!.data
    });
    await replyRepo.save(newReply);
    return newReply;
  }
}
