import { plainToClass } from 'class-transformer';
import {
  Arg,
  Authorized,
  Ctx,
  Directive,
  ID,
  Mutation,
  Resolver,
  UseMiddleware
} from 'type-graphql';
import { ChallengeServiceContext } from '../context';
import { Tag } from '../entities/Tag';
import { Wallet } from '../entities/Wallet';
import { MultiWriteProxyHmacGuard } from '../middlewares/MultiWriteProxyHmacGuard';
import { MwpChallenge_CreateWalletInput } from '../utils/inputs';
import {
  MwpChallenge_CreateWalletPayload,
  MwpChallenge_CreateWalletRollbackPayload
} from '../utils/payloads';

@Resolver(() => Wallet)
export class WalletResolver {
  @Directive('@MwpTransaction')
  @UseMiddleware(MultiWriteProxyHmacGuard)
  @Authorized()
  @Mutation(() => MwpChallenge_CreateWalletPayload, {
    name: 'mwpChallenge_CreateWallet'
  })
  async createWallet(
    @Arg('payload') payload: MwpChallenge_CreateWalletInput,
    @Arg('digest') digest: string,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const tag = await ctx.em
      .getRepository(Tag)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .findOneOrFail(payload.tagId);
    const walletRepo = ctx.em.getRepository(Wallet);
    const createdWallet = walletRepo.create({
      id: payload.walletId,
      tag
    });
    await walletRepo.save(createdWallet);
    return plainToClass(MwpChallenge_CreateWalletPayload, {
      createdWallet,
      message: `Wallet "${payload.walletId}" - scoreboard record created`
    });
  }
  @Directive('@MwpRollback')
  @UseMiddleware(MultiWriteProxyHmacGuard)
  @Authorized()
  @Mutation(() => MwpChallenge_CreateWalletRollbackPayload, {
    name: 'mwpChallenge_CreateWalletRollback'
  })
  async createWalletRollback(
    @Arg('payload', () => ID) payload: string,
    @Arg('digest') digest: string,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const walletToDelete = await ctx.em
      .getRepository(Wallet)
      .findOneOrFail({ id: payload });
    const tag = await walletToDelete.tag;
    await ctx.em.getRepository(Wallet).delete({ id: payload });
    return plainToClass(MwpChallenge_CreateWalletRollbackPayload, {
      message: `Wallet for tag "${tag.id}" - scoreboard record deleted`
    });
  }
}
