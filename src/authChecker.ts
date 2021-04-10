import { AuthChecker } from 'type-graphql';
import { ChallengeServiceContext } from './context';

export const authChecker: AuthChecker<ChallengeServiceContext> = ({ context }) => {
  return Boolean(context.user);
  // TODO when roles are implemented as user field
  // user.roles.some((role) => roles.includes(role))
};
