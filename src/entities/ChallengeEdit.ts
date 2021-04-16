import { Directive, Field, ObjectType } from 'type-graphql';
import { Entity, Index, ManyToOne } from 'typeorm';
import { AbstractPost } from './AbstractPost';
import { Challenge } from './Challenge';

@Directive(`@key(fields: "id")`)
@ObjectType({ implements: AbstractPost })
@Entity()
export class ChallengeEdit extends AbstractPost {
  // TODO shard key
  @Index()
  @ManyToOne(() => Challenge, (challenge) => challenge.edits)
  @Field(() => Challenge)
  challenge!: Challenge;
}
