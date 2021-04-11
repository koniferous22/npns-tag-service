import { InterfaceType, Field, ObjectType } from 'type-graphql';
import {
  LatexContent,
  MarkdownContent,
  UploadedContent
} from '../entities/Content';

@InterfaceType()
export abstract class BasePayload {
  @Field()
  message!: string;
}

@ObjectType({ implements: BasePayload })
export class AddMarkdownContentPayload {
  message!: string;

  @Field()
  content!: MarkdownContent;
}

@ObjectType({ implements: BasePayload })
export class AddLatexContentPayload {
  message!: string;

  @Field()
  content!: LatexContent;
}

@ObjectType({ implements: BasePayload })
export class AddUploadedContentPayload {
  message!: string;

  @Field()
  content!: UploadedContent;
}

@ObjectType({ implements: BasePayload })
export class RemoveContentPayload {
  message!: string;
}

@ObjectType({ implements: BasePayload })
export class PublishPayload {
  message!: string;
}
