import { Field, ID, InterfaceType, ObjectType } from 'type-graphql';
import { v4 } from 'uuid';

@InterfaceType({
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
})
export class Content {
  @Field(() => ID)
  id: string = v4();

  @Field()
  createdAt: Date = new Date();

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Field()
  isActive: boolean = true;
}

@ObjectType({ implements: Content })
export class MarkdownContent implements Content {
  id!: string;
  createdAt!: Date;
  isActive!: boolean;
  @Field()
  markdown!: string;
}

@ObjectType({ implements: Content })
export class LatexContent implements Content {
  id!: string;
  createdAt!: Date;
  isActive!: boolean;
  @Field()
  latex!: string;
}

@ObjectType({ implements: Content })
export class UploadedContent implements Content {
  id!: string;
  createdAt!: Date;
  isActive!: boolean;
  @Field()
  filename!: string;

  // TODO define mimetype enum
  @Field()
  mimetype!: string;
}
