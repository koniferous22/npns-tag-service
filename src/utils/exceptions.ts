export class InvalidValueError extends Error {
  name = 'InvalidValueError';
  constructor(public expected: string, public actual: string) {
    super(`Expected value: "${expected}", actual "${actual}"`);
  }
}

export class SchemaFixParseError extends Error {
  name = 'SchemaFixParseError';
  constructor(message?: string) {
    super(
      `Error during GQL schema parsing for fixing field directives${
        message ? `: ${message}` : ''
      }`
    );
  }
}

export class ComposedConfigError extends Error {
  name = 'ComposedConfigError';
  constructor(public errors: string[]) {
    super(errors.join('\n'));
  }
}

export class ConfigError extends Error {
  name = 'ConfigError';
  constructor(public message: string) {
    super(message);
  }
}

export class ConfigValidationError extends Error {
  name = 'ConfigValidationError';
  constructor(configPath: string, expectedValue: string, actual: string) {
    super(
      `Invalid config value for "${configPath}" - expected ${expectedValue}, got "${actual}"`
    );
  }
}

export class TagNotFoundError extends Error {
  name = 'TagNotFoundError';
  constructor(tagName: string, identifierType: 'id' | 'name' = 'name') {
    super(
      `Tag ${identifierType === 'id' ? 'with id ' : ''}'${tagName}' not found`
    );
  }
}

export class DeletingTagWithDescendantsError extends Error {
  name = 'DeletingTagWithDescendantsError';
  constructor(tagName: string) {
    super(`Cannot delete tag '${tagName}', delete descendants first`);
  }
}

export class ContentRefNotFound extends Error {
  name = 'ContentRefNotFound';
  constructor(entityName: string, id: string, contentId: string) {
    super(`Content "${contentId}" not found at ${entityName} "${id}"`);
  }
}

type ContentType = 'latex' | 'markdown' | 'upload';

export class MaxContentPiecesExceededError extends Error {
  name = 'MaxContentPiecesExceededError';
  constructor(
    contentType: ContentType,
    entityName: string,
    id: string,
    count: number
  ) {
    super(
      `Error adding ${contentType} content to ${entityName} "${id}", max ${count} entries allowed`
    );
  }
}

export class MaxEditsExceededError extends Error {
  name = 'MaxEditsExceededError';
  constructor(entityName: string, id: string, count: number) {
    super(`Error editing ${entityName} "${id}", max ${count} edits allowed`);
  }
}

export class UnauthorizedContentAccessError extends Error {
  name = 'UnauthorizedContentAccessError';
  constructor(entityName: string, id: string, userId?: string) {
    super(`${entityName} "${id}", attempted access by user "${userId}"`);
  }
}

export class SubmittingOnOwnChallenge extends Error {
  name = 'SubmittingOnOwnChallenge';
  constructor(userId: string, challengeId: string) {
    super(
      `User "${userId}" posting submission on own challenge "${challengeId}"`
    );
  }
}