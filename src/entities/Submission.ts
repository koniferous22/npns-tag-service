import { ObjectType, Field, Directive } from 'type-graphql';
import { Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { AbstractPost } from './AbstractPost';
import { Challenge } from './Challenge';
import { SubmissionEdit } from './SubmissionEdit';
import { Reply } from './Reply';

@Directive(`@key(fields: "id")`)
@ObjectType({ implements: AbstractPost })
@Entity()
export class Submission extends AbstractPost {
  // TODO shard key
  @ManyToOne(() => Challenge, (challenge) => challenge.submissions)
  @Index()
  @Field(() => Challenge)
  challenge!: Challenge;

  @OneToMany(() => Reply, (reply) => reply, {
    lazy: true,
    cascade: true
  })
  @Field(() => Reply)
  replies!: Reply[];

  @OneToMany(() => SubmissionEdit, (edit) => edit.submission, {
    eager: true,
    cascade: true
  })
  @Field(() => SubmissionEdit)
  edits!: SubmissionEdit[];
}
