import { Directive, Field, ObjectType } from 'type-graphql';
import { Entity, Index, ManyToOne } from 'typeorm';
import { AbstractPost } from './AbstractPost';
import { Reply } from './Reply';

@Directive(`@key(fields: "id")`)
@ObjectType({ implements: AbstractPost })
@Entity()
export class ReplyEdit extends AbstractPost {
  // TODO shard key
  @Index()
  @ManyToOne(() => Reply, (reply) => reply.edits)
  @Field(() => Reply)
  reply!: Reply;
}
