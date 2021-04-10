import { plainToClass } from 'class-transformer';
import {
  Arg,
  Args,
  ArgsType,
  Ctx,
  Field,
  FieldResolver,
  ID,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root
} from 'type-graphql';
import { v4 } from 'uuid';
import { ChallengeServiceContext } from '../context';
import { Tag } from '../entities/Tag';
import {
  DeletingTagWithDescendantsError,
  TagNotFoundError
} from '../utils/exceptions';
import {
  ChallengeConnection,
  ChallengesByTagIdInput
} from './ChallengeConnection';

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
  @Query(() => [Tag])
  async tags(
    @Ctx() ctx: ChallengeServiceContext,
    @Arg('root', { nullable: true }) root?: string
  ): Promise<Tag[]> {
    const tagRepo = ctx.em.getTreeRepository(Tag);
    if (!root) {
      return tagRepo.find();
    }
    const rootTag = await tagRepo.findOne({ name: root });
    if (!rootTag) {
      throw new TagNotFoundError(root);
    }
    return tagRepo.findDescendants(rootTag);
  }

  // TODO admin permissions
  @Mutation(() => CreateTagPayload)
  async createTag(
    @Args() { name, parentId }: CreateTagArgs,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const tagRepo = ctx.em.getTreeRepository(Tag);
    const parentTag = await tagRepo.findOne(parentId);
    if (!parentTag) {
      throw new TagNotFoundError(parentId, 'id');
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
  async deleteTag(
    @Arg('name') name: string,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    const tagRepo = ctx.em.getTreeRepository(Tag);
    const tag = await tagRepo.findOne({ name });
    if (!tag) {
      throw new TagNotFoundError(name);
    }
    const tagDescendants = await tagRepo.findDescendantsTree(tag);
    if (tagDescendants.children.length > 0) {
      throw new DeletingTagWithDescendantsError(name);
    }
    await tagRepo.remove(tag);
    return plainToClass(DeleteTagPayload, {
      message: `Tag '${name}' deleted`
    });
  }

  @FieldResolver(() => ChallengeConnection)
  challenges(
    @Root() tag: Tag,
    @Arg('input') input: ChallengesByTagIdInput,
    @Ctx() ctx: ChallengeServiceContext
  ) {
    return ChallengeConnection.challengeConnection(
      {
        ...input,
        tags: [tag.id]
      },
      ctx
    );
  }
}
