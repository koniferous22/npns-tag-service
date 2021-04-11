import { Field, ID, ObjectType } from 'type-graphql';
import { BeforeUpdate, Column, PrimaryGeneratedColumn } from 'typeorm';
import { GraphQLBoolean } from 'graphql';
import { BaseContent, ContentUnionType } from './Content';
import { User } from './User';

@ObjectType({ isAbstract: true })
export abstract class AbstractPost {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'jsonb',
    array: false,
    nullable: false,
    default: '[]'
  })
  @Field(() => [ContentUnionType])
  content!: BaseContent[];

  @Column(() => User)
  @Field(() => User)
  poster!: User;

  @Field()
  @Column()
  createdAt: Date = new Date();

  @Field()
  @Column()
  updatedAt: Date = new Date();

  @BeforeUpdate()
  updateTs() {
    this.updatedAt = new Date();
  }

  @Field(() => GraphQLBoolean)
  @Column({
    type: 'boolean'
  })
  isActive = false;
}
