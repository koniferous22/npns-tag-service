import { Directive, Field, ObjectType } from 'type-graphql';
import { Entity, Index, ManyToOne } from 'typeorm';
import { AbstractPost } from './AbstractPost';
import { Submission } from './Submission';

@Directive(`@key(fields: "id")`)
@ObjectType({ implements: AbstractPost })
@Entity()
export class SubmissionEdit extends AbstractPost {
  // TODO shard key
  @Index()
  @ManyToOne(() => Submission, (submission) => submission.edits)
  @Field(() => Submission)
  submission!: Submission;
}
