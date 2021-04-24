import { plainToClass } from 'class-transformer';
import { Field, ID, ObjectType } from 'type-graphql';
import { LessThanOrEqual, MoreThan } from 'typeorm';
import { createAbstractConnection } from './AbstractConnection';
import { Reply } from './Reply';

@ObjectType()
class ReplyCursor {
  @Field(() => ID)
  id!: string;

  @Field()
  date!: Date;
}

export const ReplyConnection = createAbstractConnection(
  Reply,
  'ReplyConnection',
  ReplyCursor,
  {
    createdAt: 'DESC'
  },
  (sub) =>
    plainToClass(ReplyCursor, {
      id: sub.id,
      date: sub.createdAt
    }),
  (cursor) => ({
    ...(cursor.id && { id: MoreThan(cursor.id) }),
    ...(cursor.date && { createdAt: LessThanOrEqual(cursor.date) })
  })
);
