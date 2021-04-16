import { FieldResolver, Resolver, Root } from 'type-graphql';
import { Content } from '../entities/Content';

// NOTE bugfix of bad date serializing
@Resolver(() => Content)
export class BaseContentResolver {
  @FieldResolver()
  createdAt(@Root() content: Content) {
    return new Date(content.createdAt);
  }
}
