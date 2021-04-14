import { getManager } from 'typeorm';
import { Wallet } from '../entities/Wallet';

// NOTE this resolver doesn't work for some reason without context injecting, so getManager() call is a workaround
export const resolveWalletReference = (wallet: Pick<Wallet, 'id'>) => {
  return getManager().getRepository(Wallet).findOneOrFail({ id: wallet.id });
};
