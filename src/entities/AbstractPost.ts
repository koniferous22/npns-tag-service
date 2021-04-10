import { Field, ID, ObjectType } from 'type-graphql';
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { GraphQLBoolean } from 'graphql';
import { MaxLength } from 'class-validator';
import { BaseContent, ContentUnionType } from './Content';
import { User } from './User';
import { Config } from '../config';

@ObjectType({ isAbstract: true })
export abstract class AbstractPost {
  static getMaxUploads() {
    return Config.getInstance().getConfig().content.limits.contentUploads;
  }

  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'jsonb',
    array: false,
    nullable: false,
    default: '[]'
  })
  @MaxLength(AbstractPost.getMaxUploads())
  @Field(() => [ContentUnionType])
  content!: BaseContent[];

  @Column(() => User)
  @Field(() => User)
  poster!: User;

  @Field()
  @Column()
  createdAt: Date = new Date();

  @Field(() => GraphQLBoolean)
  @Column({
    type: 'boolean'
  })
  isActive = false;
}
