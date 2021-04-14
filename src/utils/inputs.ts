import { Field, ID, InputType } from 'type-graphql';

@InputType()
export class MwpChallenge_CreateWalletInput {
  @Field(() => ID)
  tagId!: string;

  @Field(() => ID)
  walletId!: string;
}

@InputType()
export class MwpChallenge_BoostChallengeInput {
  @Field(() => ID)
  challengeId!: string;

  @Field()
  amount!: number;
}
