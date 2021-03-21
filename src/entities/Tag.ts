import { Directive, Field, ID, ObjectType } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  Tree,
  TreeParent,
  TreeChildren,
  OneToMany
} from 'typeorm';
import { Wallet } from './Wallet';

@Directive(`@key(fields: "name")`)
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

  // TODO include parent eventually couldn't include bc of treeRepository.findDescendants returning entities without this field
  @TreeParent()
  parent!: Tag;

  // children is excluded as graphql field,
  // No valid use case for now, even though data is hierarchical, it makes sense to return as adj. list instead
  @TreeChildren({
    cascade: true
  })
  children!: Tag[];

  @OneToMany(() => Wallet, (wallet) => wallet.tag, {
    lazy: true
  })
  @Field(() => [Wallet])
  scoreboard!: Promise<Wallet[]>;
}
