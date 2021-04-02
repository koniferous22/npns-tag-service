import { AuthChecker } from 'type-graphql';
import { TagServiceContext } from './context';

export const authChecker: AuthChecker<TagServiceContext> = ({ context }) => {
  return Boolean(context.user);
  // TODO when roles are implemented as user field
  // user.roles.some((role) => roles.includes(role))
};
