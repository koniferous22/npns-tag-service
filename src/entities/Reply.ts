import { ObjectType, Field, Directive } from 'type-graphql';
import { Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { AbstractPost } from './AbstractPost';
import { ReplyEdit } from './ReplyEdit';
import { Submission } from './Submission';

@Directive(`@key(fields: "id")`)
@ObjectType({ implements: AbstractPost })
@Entity()
export class Reply extends AbstractPost {
  // TODO shard key
  @Index()
  @ManyToOne(() => Submission, (submission) => submission.replies)
  @Field(() => Submission)
  submission!: Submission;

  @OneToMany(() => ReplyEdit, (edit) => edit.reply, {
    eager: true,
    cascade: true
  })
  @Field(() => ReplyEdit)
  edits!: ReplyEdit[];
}
