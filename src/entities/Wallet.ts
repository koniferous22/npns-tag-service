import { Directive, ObjectType, Field, ID, Int } from 'type-graphql';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Tag } from './Tag';

@Directive('@extends')
@Directive(`@key(fields: "id")`)
@ObjectType()
@Entity({
  orderBy: {
    score: 'DESC'
  }
})
export class Wallet {
  // NOTE value should be generated in account service
  @Directive('@external')
  @PrimaryColumn()
  @Field(() => ID)
  id!: string;

  @Field(() => Int)
  @Column({
    type: 'integer',
    default: 0
  })
  score = 0;

  @ManyToOne(() => Tag, {
    lazy: true
  })
  @Field(() => Tag)
  tag!: Tag;
}
