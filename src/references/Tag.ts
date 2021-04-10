import { ChallengeServiceContext } from '../context';
import { Tag } from '../entities/Tag';

export const resolveTagReference = (
  tag: Pick<Tag, 'id'>,
  ctx: ChallengeServiceContext
) => {
  return ctx.em.getRepository(Tag).findOneOrFail({ id: tag.id });
};
