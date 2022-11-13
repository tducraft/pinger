// https://eslint.org/docs/rules/
module.exports = {
  root: true,
  env: {
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  ignorePatterns: [],
  plugins: ['@typescript-eslint', 'only-warn'],
  rules: {
    '@typescript-eslint/no-empty-function': ['off'],
    '@typescript-eslint/consistent-type-imports': 'warn',
    semi: ['warn', 'never'],
    quotes: ['warn', 'single', { allowTemplateLiterals: true }],
    'comma-dangle': [
      'warn',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never', // Because prettier's trailingComma is "es5".
      },
    ],
    'require-await': ['off'],
    'no-unreachable': ['off'],
    'no-console': ['off'],
    '@typescript-eslint/no-unused-vars': ['off'],
    // 'vue/multi-word-component-names': ['off'],
    'no-useless-return': ['off'],
  },
}