import { Field, ID, ObjectType } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  Tree,
  TreeParent,
  TreeChildren
} from 'typeorm';

@ObjectType()
@Tree('nested-set')
@Entity()
@Unique(['name'])
export class Tag {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column()
  name!: string;

  @Field(() => Tag, {
    nullable: true
  })
  @TreeParent()
  parent?: Tag;

  // children is excluded as graphql field,
  // No valid use case for now, even though data is hierarchical, it makes sense to return as adj. list instead
  @TreeChildren({
    cascade: true
  })
  children!: Tag[];
}
