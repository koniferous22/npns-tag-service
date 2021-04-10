import { ChallengeServiceContext } from '../context';
import { Wallet } from '../entities/Wallet';

export const resolveWalletReference = (
  wallet: Pick<Wallet, 'id'>,
  args: any,
  ctx: ChallengeServiceContext
) => {
  return ctx.em.getRepository(Wallet).findOneOrFail({ id: wallet.id });
};
