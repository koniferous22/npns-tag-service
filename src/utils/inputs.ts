import { IsPositive } from 'class-validator';
import { Field, ID, InputType, Int } from 'type-graphql';

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

@InputType()
export class MwpChallenge_MarkChallengeSolvedInput {
  @Field(() => ID)
  challengeId!: string;

  @Field(() => ID)
  submissionId!: string;

  @Field(() => ID)
  winnerWalletId!: string;
}

@InputType()
export class ConnectionInput {
  @Field(() => Int)
  @IsPositive()
  first!: number;

  @Field({
    nullable: true
  })
  date?: Date;

  @Field(() => ID, {
    nullable: true
  })
  id?: string;
}
