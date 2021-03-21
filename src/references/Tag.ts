import { TagServiceContext } from '../context';
import { Tag } from '../entities/Tag';

export const resolveTagReference = (
  tag: Pick<Tag, 'id'>,
  ctx: TagServiceContext
) => {
  return ctx.em.getRepository(Tag).findOneOrFail({ id: tag.id });
};
