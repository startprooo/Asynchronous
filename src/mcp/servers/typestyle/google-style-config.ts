export const googleTsStyleConfig = {
  indentation: {
    style: 'space',
    size: 2
  },
  lineLength: {
    max: 80
  },
  naming: {
    classes: 'PascalCase',
    interfaces: 'PascalCase',
    typeAliases: 'PascalCase',
    functions: 'camelCase',
    variables: 'camelCase',
    constants: 'UPPER_CASE'
  },
  imports: {
    sorting: 'alphabetical',
    grouping: true
  },
  whitespace: {
    afterComma: true,
    afterSemicolon: true,
    aroundOperators: true,
    beforeBlocks: true
  },
  bestPractices: {
    maxFunctionComplexity: 10,
    preferInterfaces: true,
    requireExplicitTypes: true,
    noAny: true
  }
};
