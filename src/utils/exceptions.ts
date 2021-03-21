export class InvalidValueError extends Error {
  name = 'InvalidValueError';
  constructor(public expected: string, public actual: string) {
    super(`Expected value: "${expected}", actual "${actual}"`);
  }
}

export class SchemaFixParseError extends Error {
  name = '';
  constructor(message?: string) {
    super(
      `Error during GQL schema parsing for fixing field directives${
        message ? `: ${message}` : ''
      }`
    );
  }
}