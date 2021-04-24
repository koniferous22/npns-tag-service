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
  constructor(
    public configPath: string,
    public expectedValue: string,
    public actual: string
  ) {
    super(
      `Invalid config value for "${configPath}" - expected ${expectedValue}, got "${actual}"`
    );
  }
}

export class InvalidDigestError extends Error {
  name = 'InvalidDigestError';
  constructor(public args: unknown, public digest: string) {
    super(
      `Received invalid digest "${digest}" for args ${JSON.stringify(args)}`
    );
  }
}

export class MissingDigestError extends Error {
  name = 'MissingDigestError';
  constructor(public args: unknown) {
    super(`Missing digest for args ${JSON.stringify(args)}`);
  }
}

export class TagNotFoundError extends Error {
  name = 'TagNotFoundError';
  constructor(
    public tagName: string,
    public identifierType: 'id' | 'name' = 'name'
  ) {
    super(
      `Tag ${identifierType === 'id' ? 'with id ' : ''}'${tagName}' not found`
    );
  }
}

export class DeletingTagWithDescendantsError extends Error {
  name = 'DeletingTagWithDescendantsError';
  constructor(public tagName: string) {
    super(`Cannot delete tag '${tagName}', delete descendants first`);
  }
}

export class ContentRefNotFound extends Error {
  name = 'ContentRefNotFound';
  constructor(
    public entityName: string,
    public id: string,
    public contentId: string
  ) {
    super(`Content "${contentId}" not found at ${entityName} "${id}"`);
  }
}

type ContentType = 'latex' | 'markdown' | 'upload';

export class MaxContentPiecesExceededError extends Error {
  name = 'MaxContentPiecesExceededError';
  constructor(
    public contentType: ContentType,
    public entityName: string,
    public id: string,
    public count: number
  ) {
    super(
      `Error adding ${contentType} content to ${entityName} "${id}", max ${count} entries allowed`
    );
  }
}

export class MaxEditsExceededError extends Error {
  name = 'MaxEditsExceededError';
  constructor(
    public entityName: string,
    public id: string,
    public count: number
  ) {
    super(`Error editing ${entityName} "${id}", max ${count} edits allowed`);
  }
}

export class UnauthorizedContentAccessError extends Error {
  name = 'UnauthorizedContentAccessError';
  constructor(
    public entityName: string,
    public id: string,
    public userId?: string
  ) {
    super(`${entityName} "${id}", attempted access by user "${userId}"`);
  }
}

export class SubmittingOnOwnChallenge extends Error {
  name = 'SubmittingOnOwnChallenge';
  constructor(public userId: string, public challengeId: string) {
    super(
      `User "${userId}" posting submission on own challenge "${challengeId}"`
    );
  }
}

export class NegativeBoostError extends Error {
  name = 'NegativeBoostError';
  constructor(public challengeId: string, public boost: number) {
    super(`Challenge "${challengeId}" reached negative boost "${boost}"`);
  }
}

export class UpdatingSolvedChallenge extends Error {
  name = 'UpdatingSolvedChallenge';
  constructor(
    public challengeId: string,
    public operationType: 'boost' | 'mark solved'
  ) {
    super(
      `Attempting to ${operationType} already solved challenge "${challengeId}"`
    );
  }
}

export class UpdatingInactiveChallenge extends Error {
  name = 'UpdatingInactiveChallenge';
  constructor(public challengeId: string) {
    super(`Attempting to update inactive challenge "${challengeId}"`);
  }
}

export class PostNotAvailable extends Error {
  name = 'PostNotAvailable';
  constructor(public postId: string) {
    super(`Post ${postId} not published yet`);
  }
}
