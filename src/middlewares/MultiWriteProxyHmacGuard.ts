import { MiddlewareFn } from 'type-graphql';
import { ChallengeServiceContext } from '../context';
import { createHmacDigest } from '../utils/createHmacDigest';
import { MissingDigestError, InvalidDigestError } from '../utils/exceptions';

export const MultiWriteProxyHmacGuard: MiddlewareFn<ChallengeServiceContext> = async (
  { args, context },
  next
) => {
  if (args.payload) {
    if (!args.digest) {
      throw new MissingDigestError(args.payload);
    }
    const actualDigest = createHmacDigest(
      args.payload,
      context.config.getConfig()
    );
    if (args.digest !== actualDigest) {
      throw new InvalidDigestError(args.payload, args.digest);
    }
  }
  return next();
};
