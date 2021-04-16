import { classToPlain, plainToClass } from 'class-transformer';
import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  ClassType,
  Ctx,
  Directive,
  Field,
  ID,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware
} from 'type-graphql';
import { Repository } from 'typeorm';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { ChallengeServiceContext } from '../context';
import { AbstractPost } from '../entities/AbstractPost';
import {
  Content,
  LatexContent,
  MarkdownContent,
  UploadedContent
} from '../entities/Content';
import { getMaxUploads } from '../utils/contentLimits';
import {
  ContentRefNotFound,
  MaxContentPiecesExceededError,
  UnauthorizedContentAccessError
} from '../utils/exceptions';
import {
  AddLatexContentPayload,
  AddMarkdownContentPayload,
  AddUploadedContentPayload,
  MwpChallenge_PublishPayload,
  MwpChallenge_PublishRollbackPayload,
  RemoveContentPayload
} from '../utils/payloads';
import { MultiWriteProxyHmacGuard } from '../middlewares/MultiWriteProxyHmacGuard';

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

  @InputType(`AddUploadedContentTo${entityName}Input`)
  class AddUploadedContentInput {
    @Field(() => ID)
    id!: string;

    @Field(() => GraphQLUpload)
    upload!: Promise<FileUpload>;
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

    async getRecordAsOwner(id: string, ctx: ChallengeServiceContext) {
      const post = await this.getRepository(ctx).findOneOrFail(id);
      // NOTE Authorized decorator assumed
      if (ctx.user?.data.id !== post.poster.id) {
        // TODO try to implement this as a Decorator
        throw new UnauthorizedContentAccessError(
          entityName,
          post.id,
          ctx.user?.data.id
        );
      }
      return post;
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
      const post = await this.getRecordAsOwner(input.id, ctx);
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
      post.content.push((classToPlain(markdownContent) as unknown) as Content);
      // NOTE only subclassed entitites are ofc assumed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.getRepository(ctx).save(post as any);
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
      const post = await this.getRecordAsOwner(input.id, ctx);
      const latexContent = new LatexContent();
      latexContent.latex = input.latex;
      post.content.push((classToPlain(latexContent) as unknown) as Content);
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
      await this.getRepository(ctx).save(post as any);
      return plainToClass(AddLatexContentPayload, {
        message: `Latex content uploaded for ${entityName.toLowerCase()} "${
          input.id
        }"`,
        content: latexContent
      });
    }

    @Authorized()
    @Mutation(() => AddUploadedContentPayload, {
      name: `addUploadedContentTo${entityName}`
    })
    async addUploadedContent(
      @Arg('input') input: AddUploadedContentInput,
      @Ctx() ctx: ChallengeServiceContext
    ) {
      const post = await this.getRecordAsOwner(input.id, ctx);
      const fileUpload = await input.upload;
      const uploadedContent = new UploadedContent();
      uploadedContent.mimetype = fileUpload.mimetype;
      uploadedContent.filename = fileUpload.filename;
      post.content.push((classToPlain(uploadedContent) as unknown) as Content);
      // class-validator didn't work on config-dependant setting
      if (post.content.length >= getMaxUploads()) {
        throw new MaxContentPiecesExceededError(
          'latex',
          entityName,
          input.id,
          getMaxUploads()
        );
      }
      await ctx.gridFileSystem.fileUpload(fileUpload);
      // NOTE only subclassed entitites are ofc assumed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.getRepository(ctx).save(post as any);
      return plainToClass(UploadedContent, {
        message: `Latex content uploaded for ${entityName.toLowerCase()} "${
          input.id
        }"`,
        content: uploadedContent
      });
    }

    @Authorized()
    @Mutation(() => RemoveContentPayload, {
      name: `removeContentFrom${entityName}`
    })
    async removeContent(
      @Arg('input') input: RemoveContentInput,
      @Ctx() ctx: ChallengeServiceContext
    ) {
      const post = await this.getRecordAsOwner(input.id, ctx);
      if (!post.content.find(({ id }) => id === input.contentId)) {
        throw new ContentRefNotFound(entityName, post.id, input.contentId);
      }
      post.content = post.content.filter(({ id }) => id !== input.contentId);
      // NOTE only subclassed entitites are ofc assumed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.getRepository(ctx).save(post as any);
      return plainToClass(RemoveContentPayload, {
        message: `Content "${input.contentId}" removed from ${entityName} "${post.id}"`
      });
    }

    @Directive('@MwpTransaction')
    @UseMiddleware(MultiWriteProxyHmacGuard)
    @Authorized()
    @Mutation(() => MwpChallenge_PublishPayload, {
      name: `mwpChallenge_Publish${entityName}`
    })
    async publish(
      @Arg('payload', () => ID) id: string,
      @Ctx() ctx: ChallengeServiceContext
    ) {
      const post = await this.getRecordAsOwner(id, ctx);
      post.isActive = true;
      // NOTE only subclassed entitites are ofc assumed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.getRepository(ctx).save(post as any);
      return plainToClass(MwpChallenge_PublishPayload, {
        message: `${entityName} "${id}" published`,
        publishedId: post.id
      });
    }

    @Directive('@MwpRollback')
    @UseMiddleware(MultiWriteProxyHmacGuard)
    @Authorized()
    @Mutation(() => MwpChallenge_PublishRollbackPayload, {
      name: `mwpChallenge_Publish${entityName}Rollback`
    })
    async publishRollback(
      @Arg('payload', () => ID) id: string,
      @Ctx() ctx: ChallengeServiceContext
    ) {
      const post = await this.getRecordAsOwner(id, ctx);
      post.isActive = false;
      // NOTE only subclassed entitites are ofc assumed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.getRepository(ctx).save(post as any);
      return plainToClass(MwpChallenge_PublishRollbackPayload, {
        message: `${entityName} "${id}" publish rolled back`
      });
    }
  }
  return AbstractPostResolver;
}
