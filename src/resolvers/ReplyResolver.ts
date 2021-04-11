import { Authorized, Mutation, Arg, Ctx, Resolver, ID } from 'type-graphql';
import { ChallengeServiceContext } from '../context';
import { ReplyEdit } from '../entities/ReplyEdit';
import { getMaxPostEdits } from '../utils/contentLimits';
import { MaxEditsExceededError } from '../utils/exceptions';
import { createAbstractPostResolver } from './AbstractPostResolver';
import { Reply } from '../entities/Reply';

const ReplyEditBaseResolver = createAbstractPostResolver(
  'ReplyEdit',
  ReplyEdit
);

@Resolver(() => ReplyEdit)
export class ReplyEditResolver extends ReplyEditBaseResolver {
  @Authorized()
  @Mutation(() => ReplyEdit, {
    name: 'postReplyEdit'
  })
  async post(
    @Arg('reply', () => ID) replyId: string,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const reply = await ctx.em.getRepository(Reply).findOneOrFail(replyId);
    if (reply.edits.length >= getMaxPostEdits()) {
      throw new MaxEditsExceededError('Reply', replyId, getMaxPostEdits());
    }
    const ReplyEditRepo = ctx.em.getRepository(ReplyEdit);
    const newReplyEdit = ReplyEditRepo.create({
      reply,
      // NOTE validated by Authorized decorator
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      poster: ctx.user!.data
    });
    await ReplyEditRepo.save(newReplyEdit);
    return newReplyEdit;
  }
}
