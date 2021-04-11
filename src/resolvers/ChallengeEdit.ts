import { Authorized, Mutation, Arg, Ctx, Resolver, ID } from 'type-graphql';
import { ChallengeServiceContext } from '../context';
import { Challenge } from '../entities/Challenge';
import { ChallengeEdit } from '../entities/ChallengeEdit';
import { getMaxPostEdits } from '../utils/contentLimits';
import { MaxEditsExceededError } from '../utils/exceptions';
import { createAbstractPostResolver } from './AbstractPostResolver';

const ChallengeEditBaseResolver = createAbstractPostResolver(
  'ChallengeEdit',
  ChallengeEdit
);

@Resolver(() => ChallengeEdit)
export class ChallengeEditResolver extends ChallengeEditBaseResolver {
  @Authorized()
  @Mutation(() => ChallengeEdit, {
    name: 'postChallengeEdit'
  })
  async post(
    @Arg('challenge', () => ID) challengeId: string,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const challenge = await ctx.em
      .getRepository(Challenge)
      .findOneOrFail(challengeId);
    if (challenge.edits.length >= getMaxPostEdits()) {
      throw new MaxEditsExceededError(
        'Challenge',
        challengeId,
        getMaxPostEdits()
      );
    }
    const challengeEditRepo = ctx.em.getRepository(ChallengeEdit);
    const newChallengeEdit = challengeEditRepo.create({
      challenge,
      // NOTE validated by Authorized decorator
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      poster: ctx.user!.data
    });
    await challengeEditRepo.save(newChallengeEdit);
    return newChallengeEdit;
  }
}
