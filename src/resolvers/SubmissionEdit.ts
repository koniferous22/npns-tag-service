import { Authorized, Mutation, Arg, Ctx, Resolver, ID } from 'type-graphql';
import { ChallengeServiceContext } from '../context';
import { Submission } from '../entities/Submission';
import { SubmissionEdit } from '../entities/SubmissionEdit';
import { getMaxPostEdits } from '../utils/contentLimits';
import { MaxEditsExceededError } from '../utils/exceptions';
import { createAbstractPostResolver } from './AbstractPostResolver';

const SubmissionEditBaseResolver = createAbstractPostResolver(
  'SubmissionEdit',
  SubmissionEdit
);

@Resolver(() => SubmissionEdit)
export class SubmissionEditResolver extends SubmissionEditBaseResolver {
  @Authorized()
  @Mutation(() => SubmissionEdit, {
    name: 'postSubmissionEdit'
  })
  async post(
    @Arg('submission', () => ID) submissionId: string,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const submission = await ctx.em
      .getRepository(Submission)
      .findOneOrFail(submissionId);
    if (submission.edits.length >= getMaxPostEdits()) {
      throw new MaxEditsExceededError(
        'Submission',
        submissionId,
        getMaxPostEdits()
      );
    }
    const submissionEditRepo = ctx.em.getRepository(SubmissionEdit);
    const newSubmissionEdit = submissionEditRepo.create({
      submission,
      // NOTE validated by Authorized decorator
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      poster: ctx.user!.data
    });
    await submissionEditRepo.save(newSubmissionEdit);
    return newSubmissionEdit;
  }
}
