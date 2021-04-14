import { getManager } from 'typeorm';
import { Tag } from '../entities/Tag';

// NOTE this resolver doesn't work for some reason without context injecting, so getManager() call is a workaround
export const resolveTagReference = (tag: Pick<Tag, 'id'>) => {
  return getManager().getRepository(Tag).findOneOrFail({ id: tag.id });
};
