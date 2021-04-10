import { ObjectType, Directive, Field, ID } from 'type-graphql';
import { Column } from 'typeorm';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class User {
  @Column({
    name: 'user'
  })
  @Field(() => ID)
  @Directive('@external')
  id!: string;
}
