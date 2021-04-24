import { plainToClass } from 'class-transformer';
import { Field, ID, ObjectType } from 'type-graphql';
import { LessThanOrEqual, MoreThan } from 'typeorm';
import { createAbstractConnection } from './AbstractConnection';
import { Submission } from './Submission';

@ObjectType()
class SubmissionCursor {
  @Field(() => ID)
  id!: string;

  @Field()
  date!: Date;
}

export const SubmissionConnection = createAbstractConnection(
  Submission,
  'SubmissionConnection',
  SubmissionCursor,
  {
    createdAt: 'DESC'
  },
  (sub) =>
    plainToClass(SubmissionCursor, {
      id: sub.id,
      date: sub.createdAt
    }),
  (cursor) => ({
    ...(cursor.id && { id: MoreThan(cursor.id) }),
    ...(cursor.date && { createdAt: LessThanOrEqual(cursor.date) })
  })
);
