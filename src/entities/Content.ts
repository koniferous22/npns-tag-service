import { createUnionType, Field, ID, ObjectType } from 'type-graphql';
import { v4 } from 'uuid';

@ObjectType({ isAbstract: true })
export class BaseContent {
  @Field(() => ID)
  id: string = v4();

  @Field()
  createdAt: Date = new Date();

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Field()
  isActive: boolean = true;
}

@ObjectType()
export class MarkdownContent extends BaseContent {
  @Field()
  markdown!: string;
}

@ObjectType()
export class LatexContent extends BaseContent {
  @Field()
  latex!: string;
}

@ObjectType()
export class UploadedContent extends BaseContent {
  @Field()
  filename!: string;

  // TODO define mimetype enum
  @Field()
  mimetype!: string;
}

export const ContentUnionType = createUnionType({
  name: 'Content',
  types: () => [MarkdownContent, LatexContent, UploadedContent] as const,
  resolveType: (value) => {
    if ('markdown' in value) {
      return MarkdownContent;
    }
    if ('latex' in value) {
      return LatexContent;
    }
    if ('filename' in value) {
      return UploadedContent;
    }
    return undefined;
  }
});
