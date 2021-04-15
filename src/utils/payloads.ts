import { InterfaceType, Field, ObjectType } from 'type-graphql';
import { Challenge } from '../entities/Challenge';
import {
  LatexContent,
  MarkdownContent,
  UploadedContent
} from '../entities/Content';
import { Wallet } from '../entities/Wallet';

@InterfaceType()
export abstract class BasePayload {
  @Field()
  message!: string;
}

@ObjectType({ implements: BasePayload })
export class AddMarkdownContentPayload {
  message!: string;

  @Field()
  content!: MarkdownContent;
}

@ObjectType({ implements: BasePayload })
export class AddLatexContentPayload {
  message!: string;

  @Field()
  content!: LatexContent;
}

@ObjectType({ implements: BasePayload })
export class AddUploadedContentPayload {
  message!: string;

  @Field()
  content!: UploadedContent;
}

@ObjectType({ implements: BasePayload })
export class RemoveContentPayload {
  message!: string;
}

@ObjectType({ implements: BasePayload })
export class MwpChallenge_PublishPayload {
  message!: string;
}

@ObjectType({ implements: BasePayload })
export class MwpChallenge_PublishRollbackPayload {
  message!: string;
}

@ObjectType({ implements: BasePayload })
export class MwpChallenge_CreateWalletPayload implements BasePayload {
  message!: string;

  @Field(() => Wallet)
  createdWallet!: Wallet;
}

export class MwpChallenge_CreateWalletRollbackPayload implements BasePayload {
  message!: string;
}

@ObjectType({ implements: BasePayload })
export class MwpChallenge_BoostChallengePayload implements BasePayload {
  message!: string;

  @Field(() => Challenge)
  challenge!: Challenge;
}

export class MwpChallenge_BoostChallengeRollbackPayload implements BasePayload {
  message!: string;
}

@ObjectType({ implements: BasePayload })
export class MwpChallenge_MarkChallengeSolvedPayload implements BasePayload {
  message!: string;

  @Field(() => Challenge)
  challenge!: Challenge;
}

export class MwpChallenge_MarkChallengeSolvedRollbackPayload
  implements BasePayload {
  message!: string;
}
