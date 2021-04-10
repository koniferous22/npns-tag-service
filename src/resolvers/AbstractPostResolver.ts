import { classToPlain, plainToClass } from 'class-transformer';
import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  ClassType,
  Ctx,
  Field,
  ID,
  InputType,
  Mutation,
  Query,
  Resolver
} from 'type-graphql';
import { Repository } from 'typeorm';
import { ChallengeServiceContext } from '../context';
import { AbstractPost } from '../entities/AbstractPost';
import {
  BaseContent,
  LatexContent,
  MarkdownContent
} from '../entities/Content';
import { ContentRefNotFound } from '../utils/exceptions';
import {
  AddLatexContentPayload,
  AddMarkdownContentPayload,
  PublishPayload,
  RemoveContentPayload
} from '../utils/payloads';

export function createAbstractPostResolver<PostT extends AbstractPost>(
  entityName: string,
  entityClass: ClassType<AbstractPost>
) {
  // * Input types
  @InputType()
  class AddMarkdownContentInput {
    @Field(() => ID, {
      name: `${entityName.toLowerCase()}Id`
    })
    id!: string;

    @Field()
    markdown!: string;
  }
  @InputType()
  class AddLatexContentInput {
    @Field(() => ID, {
      name: `${entityName.toLowerCase()}Id`
    })
    id!: string;

    @Field()
    latex!: string;
  }

  @InputType()
  class RemoveContentInput {
    @Field(() => ID, {
      name: `${entityName.toLowerCase()}Id`
    })
    id!: string;

    @Field(() => ID)
    contentId!: string;
  }
  @ArgsType()
  class PostArgs {
    @Field(() => ID, {
      name: `${entityName.toLowerCase()}Id`
    })
    id!: string;
  }

  @Resolver({ isAbstract: true })
  abstract class AbstractPostResolver {
    abstract post(
      parentId: string,
      ctx: ChallengeServiceContext
    ): Promise<PostT>;

    getRepository(ctx: ChallengeServiceContext): Repository<PostT> {
      return (ctx.em.getRepository(
        entityClass
      ) as unknown) as Repository<PostT>;
    }
    getRecord(id: string, ctx: ChallengeServiceContext) {
      return this.getRepository(ctx).findOneOrFail(id);
    }

    @Query(() => entityClass, {
      name: `${entityName.toLowerCase()}ById`
    })
    findById(@Args() args: PostArgs, @Ctx() ctx: ChallengeServiceContext) {
      return this.getRecord(args.id, ctx);
    }

    @Authorized()
    @Mutation(() => AddMarkdownContentPayload, {
      name: `addMarkdownContentTo${entityName}`
    })
    async addMarkdownContent(
      @Arg('input') input: AddMarkdownContentInput,
      @Ctx() ctx: ChallengeServiceContext
    ) {
      const post = await this.getRecord(input.id, ctx);
      const markdownContent = new MarkdownContent();
      markdownContent.markdown = input.markdown;
      post.content.push(
        (classToPlain(markdownContent) as unknown) as BaseContent
      );
      // NOTE only subclassed entitites are ofc assumed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.getRepository(ctx).save(post as any);
      return plainToClass(AddMarkdownContentPayload, {
        message: `Markdown content uploaded for ${entityName.toLowerCase()} "${
          input.id
        }"`,
        content: markdownContent
      });
    }

    @Authorized()
    @Mutation(() => AddLatexContentPayload, {
      name: `addLatexContentTo${entityName}`
    })
    async addLatexContent(
      @Arg('input') input: AddLatexContentInput,
      @Ctx() ctx: ChallengeServiceContext
    ) {
      const post = await this.getRecord(input.id, ctx);
      const latexContent = new LatexContent();
      latexContent.latex = input.latex;
      post.content.push((classToPlain(latexContent) as unknown) as BaseContent);
      // NOTE only subclassed entitites are ofc assumed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.getRepository(ctx).save(post as any);
      return plainToClass(AddLatexContentPayload, {
        message: `Latex content uploaded for ${entityName.toLowerCase()} "${
          input.id
        }"`,
        content: latexContent
      });
    }

    // TODO file upload

    @Authorized()
    @Mutation(() => RemoveContentPayload, {
      name: `removeContentFrom${entityName}`
    })
    async removeContent(
      @Arg('input') input: RemoveContentInput,
      @Ctx() ctx: ChallengeServiceContext
    ) {
      const post = await this.getRecord(input.id, ctx);
      if (!post.content.find(({ id }) => id === input.contentId)) {
        throw new ContentRefNotFound(entityName, post.id, input.contentId);
      }
      post.content = post.content.filter(({ id }) => id !== input.contentId);
      // NOTE only subclassed entitites are ofc assumed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.getRepository(ctx).save(post as any);
      return plainToClass(RemoveContentPayload, {
        message: `Content "${input.contentId}" removed from ${entityName} "${post.id}"`
      });
    }

    @Authorized()
    @Mutation(() => PublishPayload, {
      name: `publish${entityName}`
    })
    async publish(@Args() args: PostArgs, @Ctx() ctx: ChallengeServiceContext) {
      const post = await this.getRecord(args.id, ctx);
      post.isActive = true;
      // NOTE only subclassed entitites are ofc assumed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.getRepository(ctx).save(post as any);
      return plainToClass(PublishPayload, {
        message: `${entityName} "${args.id}" published`
      });
    }
  }
  return AbstractPostResolver;
}
