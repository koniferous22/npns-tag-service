import { Field, ID, InterfaceType } from 'type-graphql';
import { BeforeUpdate, Column, PrimaryGeneratedColumn } from 'typeorm';
import { GraphQLBoolean } from 'graphql';
import { Content } from './Content';
import { User } from './User';

@InterfaceType()
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
  @Field(() => [Content])
  content!: Content[];

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
