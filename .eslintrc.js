const jsonRules = {
    'indent': [
        'error',
        4,
        {
            SwitchCase: 1,
            ignoredNodes: ['VariableDeclaration[declarations.length=0]']
        }
    ],
    '@typescript-eslint/consistent-type-assertions': 'off'
};

const javascriptRules = {
    ...jsonRules,
    '@nx/enforce-module-boundaries': [
        'error',
        {
            enforceBuildableLibDependency: true,
            allow: [],
            depConstraints: [
                {
                    sourceTag: '*',
                    onlyDependOnLibsWithTags: ['*']
                }
            ]
        }
    ],
    'react/style-prop-object': 'off',
    'quotes': ['error', 'single'],
    'quote-props': ['error', 'consistent-as-needed'],
    'comma-dangle': ['error', 'never'],
    'no-trailing-spaces': 'error',
    'no-extra-semi': 'error',
    'no-unused-vars': [
        'error',
        {
            args: 'after-used',
            varsIgnorePattern: '^__unused',
            caughtErrorsIgnorePattern: '^__unused',
            destructuredArrayIgnorePattern: '^_u'
        }
    ],
    'semi': ['error', 'always']
};

const typescriptRules = {
    ...javascriptRules,
    'no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-unused-vars': javascriptRules['no-unused-vars'],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/promise-function-async': 'error',
    '@typescript-eslint/no-misused-promises': 'error'
};

module.exports = {
    root: true,
    env: { es6: true },
    parserOptions: {
        ecmaVersion: 2021,
        tsconfigRootDir: __dirname,
        EXPERIMENTAL_useProjectService: true,
        warnOnUnsupportedTypeScriptVersion: false
    },
    ignorePatterns: [
        '**/*',
        '!**/*.json',
        '!**/*.js',
        '!**/*.mjs',
        '!**/*.ts',
        '!**/*.mts',
        'dist/**',
        'tmp/**',
        'tools/**/_msr*',
        'node_modules/**'
    ],
    plugins: ['@nx'],
    overrides: [
        {
            files: ['*.ts', '*.tsx', '*.mts'],
            extends: ['plugin:@nx/typescript'],
            rules: typescriptRules,
            parserOptions: {
                project: [
                    './tsconfig.eslint.json'
                ]
            }
        },
        {
            files: ['*.js', '*.jsx'],
            extends: ['plugin:@nx/javascript'],
            rules: javascriptRules
        },
        {
            files: ['*.mjs'],
            extends: ['plugin:@nx/javascript'],
            rules: javascriptRules,
            parserOptions: {
                sourceType: 'module'
            }
        },
        {
            files: ['*.json'],
            parser: 'jsonc-eslint-parser',
            extends: ['plugin:jsonc/recommended-with-json'],
            rules: jsonRules
        }
    ]
};
