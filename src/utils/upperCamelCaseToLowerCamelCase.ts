export const upperCamelCaseToLowerCamelCase = (uccs: string) =>
  uccs.length > 0 ? `${uccs[0].toLowerCase()}${uccs.slice(1)}` : uccs;
