import { Authorized, Mutation, Arg, ID, Ctx, Resolver } from 'type-graphql';
import { ChallengeServiceContext } from '../context';
import { Challenge } from '../entities/Challenge';
import { Submission } from '../entities/Submission';
import { SubmittingOnOwnChallenge } from '../utils/exceptions';
import { createAbstractPostResolver } from './AbstractPostResolver';

const SubmissionBaseResolver = createAbstractPostResolver(
  'Submission',
  Submission
);

@Resolver(() => Submission)
export class SubmissionResolver extends SubmissionBaseResolver {
  @Authorized()
  @Mutation(() => Submission, {
    name: 'postSubmission'
  })
  async post(
    @Arg('challenge', () => ID) challengeId: string,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const challenge = await ctx.em
      .getRepository(Challenge)
      .findOneOrFail(challengeId);
    if (ctx.user?.data?.id === challenge.poster.id) {
      throw new SubmittingOnOwnChallenge(challenge.poster.id, challenge.id);
    }
    const submissionRepo = ctx.em.getRepository(Submission);
    const newSubmission = submissionRepo.create({
      challenge,
      // NOTE validated by Authorized decorator
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      poster: ctx.user!.data
    });
    await submissionRepo.save(newSubmission);
    return newSubmission;
  }
}
