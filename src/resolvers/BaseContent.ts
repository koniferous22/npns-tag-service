import { FieldResolver, Resolver, Root } from 'type-graphql';
import { BaseContent } from '../entities/Content';

// NOTE bugfix of bad date serializing
@Resolver(() => BaseContent)
export class BaseContentResolver {
  @FieldResolver()
  createdAt(@Root() content: BaseContent) {
    return new Date(content.createdAt);
  }
}
