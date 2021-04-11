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
import { Config } from '../config';
import { ChallengeServiceContext } from '../context';
import { AbstractPost } from '../entities/AbstractPost';
import {
  BaseContent,
  LatexContent,
  MarkdownContent
} from '../entities/Content';
import {
  ContentRefNotFound,
  MaxContentPiecesExceededError
} from '../utils/exceptions';
import {
  AddLatexContentPayload,
  AddMarkdownContentPayload,
  PublishPayload,
  RemoveContentPayload
} from '../utils/payloads';

const getMaxUploads = () => {
  return Config.getInstance().getConfig().content.limits.contentUploads;
};

export function createAbstractPostResolver<PostT extends AbstractPost>(
  entityName: string,
  entityClass: ClassType<AbstractPost>
) {
  // * Input types
  @InputType(`AddMarkdownContentTo${entityName}Input`)
  class AddMarkdownContentInput {
    // NOTE typegraphql bug, renaming Fields breaks the input type, otherwise would be implemented like this
    // @Field(() => ID, {
    //   name: `${entityName.toLowerCase()}Id`
    // })
    @Field(() => ID)
    id!: string;

    @Field()
    markdown!: string;
  }
  @InputType(`AddLatexContentTo${entityName}Input`)
  class AddLatexContentInput {
    @Field(() => ID)
    id!: string;

    @Field()
    latex!: string;
  }

  @InputType(`RemoveContentFrom${entityName}Input`)
  class RemoveContentInput {
    @Field(() => ID)
    id!: string;

    @Field(() => ID)
    contentId!: string;
  }
  @ArgsType()
  class FindPostArgs {
    @Field(() => ID)
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
    findById(@Args() args: FindPostArgs, @Ctx() ctx: ChallengeServiceContext) {
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
      // class-validator didn't work on config-dependant setting
      if (post.content.length >= getMaxUploads()) {
        throw new MaxContentPiecesExceededError(
          'markdown',
          entityName,
          input.id,
          getMaxUploads()
        );
      }
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
      // class-validator didn't work on config-dependant setting
      if (post.content.length >= getMaxUploads()) {
        throw new MaxContentPiecesExceededError(
          'latex',
          entityName,
          input.id,
          getMaxUploads()
        );
      }
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
    async publish(
      @Args() args: FindPostArgs,
      @Ctx() ctx: ChallengeServiceContext
    ) {
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
