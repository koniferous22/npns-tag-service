import { plainToClass } from 'class-transformer';
import {
  Arg,
  Args,
  ArgsType,
  Ctx,
  Field,
  ID,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { v4 } from 'uuid';
import { TagServiceContext } from '../context';
import { Tag } from '../entities/Tag';

@ArgsType()
class CreateTagArgs {
  @Field()
  name!: string;
  @Field(() => ID)
  parentId!: string;
}

@ObjectType()
class CreateTagPayload {
  @Field()
  message!: string;
  @Field(() => Tag)
  createdTag!: Tag;
}

@ObjectType()
class DeleteTagPayload {
  @Field()
  message!: string;
}

@Resolver(() => Tag)
export class TagResolver {
  // TODO not any advantage of using custom decorators
  private tagRepo = getConnection().getTreeRepository(Tag);

  @Query(() => [Tag])
  async tags(
    @Ctx() ctx: TagServiceContext,
    @Arg('root', { nullable: true }) root?: string
  ): Promise<Tag[]> {
    const tagRepo = ctx.em.getTreeRepository(Tag);
    if (!root) {
      return tagRepo.find();
    }
    const rootTag = await tagRepo.findOne({ name: root });
    if (!rootTag) {
      throw new Error(`Tag '${root}' not found`);
    }
    return tagRepo.findDescendants(rootTag);
  }

  // TODO admin permissions
  @Mutation(() => CreateTagPayload)
  async createTag(
    @Args() { name, parentId }: CreateTagArgs,
    @Ctx() ctx: TagServiceContext
  ) {
    const tagRepo = ctx.em.getTreeRepository(Tag);
    const parentTag = await tagRepo.findOne(parentId);
    if (!parentTag) {
      throw new Error(`No parent with id ${parentId} found`);
    }
    const createdTag = tagRepo.create({
      id: v4(),
      name,
      parent: parentTag
    });
    await tagRepo.save(createdTag);
    return plainToClass(CreateTagPayload, {
      message: 'Tag created',
      createdTag
    });
  }

  @Mutation(() => DeleteTagPayload)
  async deleteTag(@Arg('name') name: string, @Ctx() ctx: TagServiceContext) {
    const tagRepo = ctx.em.getTreeRepository(Tag);
    const tag = await tagRepo.findOne({ name });
    if (!tag) {
      throw new Error(`No tag '${name}' found`);
    }
    const tagDescendants = await tagRepo.findDescendantsTree(tag);
    if (tagDescendants.children.length > 0) {
      throw new Error(`Cannot delete tag '${name}', delete descendants first`);
    }
    await tagRepo.remove(tag);
    return plainToClass(DeleteTagPayload, {
      message: `Tag '${name}' deleted`
    });
  }
}
