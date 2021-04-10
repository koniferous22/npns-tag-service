import { GraphQLString } from 'graphql';
import { Directive, Field, Float, Int, ObjectType } from 'type-graphql';
import { Column, Entity, Index, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { AbstractPost } from './AbstractPost';
import { ChallengeEdit } from './ChallengeEdit';
import { Submission } from './Submission';
import { Tag } from './Tag';

@Directive(`@key(fields: "id")`)
@ObjectType()
@Entity()
export class Challenge extends AbstractPost {
  // TODO shard key
  @Index()
  @ManyToOne(() => Tag, {
    lazy: true
  })
  @Field(() => Tag)
  tag!: Tag;

  @Index()
  @Column({
    type: 'integer'
  })
  @Field(() => Int)
  views = 0;

  @Index()
  @Column({
    type: 'float8'
  })
  @Field(() => Float)
  boost = 0;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Field(() => GraphQLString)
  @Column({
    type: 'varchar'
  })
  title = '';

  @OneToOne(() => Submission, (submission) => submission.challenge, {
    nullable: true
  })
  @Field(() => Submission, {
    nullable: true
  })
  acceptedSubmission: Submission | null = null;

  @OneToMany(() => Submission, (submission) => submission.challenge, {
    lazy: true,
    cascade: true
  })
  @Field(() => Submission)
  submissions!: Submission[];

  @OneToMany(() => ChallengeEdit, (edit) => edit.challenge, {
    eager: true,
    cascade: true
  })
  @Field(() => ChallengeEdit)
  edits!: ChallengeEdit[];
  // TODO link transactions with this collection
}
