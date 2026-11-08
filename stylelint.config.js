import postcssHtml from 'postcss-html';

export default {
  ignoreFiles: ['**/coverage/**', '**/dist/**', '**/build/**', '**/public/**', '**/node_modules/**', '**/vendor/**'],
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order'],
  plugins: ['stylelint-declaration-strict-value'],
  overrides: [
    {
      files: ['*.vue', '**/*.vue'],
      customSyntax: postcssHtml,
    },
  ],
  rules: {
    'selector-class-pattern': [
      '^([cou]-)?[a-z0-9-]+(__[a-z0-9-]+)?(--[a-z0-9-]+)?$',
      { message: 'Els selectors han de seguir la nomenclatura BEM amb prefixos opcionals ITCSS (c-, o-, u-)' },
    ],
    'scss/dollar-variable-pattern': ['^[a-z][a-z0-9-]*$', { message: 'Les variables Sass han de ser kebab-case' }],
    'container-name-pattern': [
      String.raw`^[a-z][a-z0-9-]*$|^#{\$[a-z][a-z0-9-]*}$`,
      { message: 'El nom del contenidor ha de ser kebab-case o una variable Sass' },
    ],

    'selector-max-id': 0,
    'declaration-no-important': true,
    'max-nesting-depth': 3,

    'rule-empty-line-before': [
      'always-multi-line',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
      },
    ],
    'comment-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['stylelint-commands'],
      },
    ],

    'shorthand-property-no-redundant-values': true,
    'unit-no-unknown': true,
    'property-no-unknown': true,
    'color-no-invalid-hex': true,
    'color-named': 'never',
    'color-function-notation': 'modern',
    'alpha-value-notation': 'percentage',

    'scale-unlimited/declaration-strict-value': [
      [
        'font-size',
        'margin',
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left',
        'margin-inline',
        'margin-inline-start',
        'margin-inline-end',
        'margin-block',
        'margin-block-start',
        'margin-block-end',
        'padding',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'padding-inline',
        'padding-inline-start',
        'padding-inline-end',
        'padding-block',
        'padding-block-start',
        'padding-block-end',
        'gap',
        'row-gap',
        'column-gap',
        'width',
        'height',
        'min-width',
        'max-width',
        'min-height',
        'max-height',
      ],
      {
        ignoreValues: [
          '0',
          'auto',
          'inherit',
          'unset',
          'none',
          'fit-content',
          String.raw`/^\d+(?:\.\d+)?%$/`,
          String.raw`/^\d+(?:\.\d+)?vh$/`,
          String.raw`/^\d+(?:\.\d+)?vw$/`,
          String.raw`/^var\(--/`,
          String.raw`/^calc\(/`,
        ],
        message: 'Utilitza la funció to-rem() en lloc de valors fixos en px',
      },
    ],

    'declaration-block-no-shorthand-property-overrides': true,
    'font-family-name-quotes': 'always-where-recommended',
    'function-url-no-scheme-relative': true,
    'function-url-quotes': 'always',
    'function-linear-gradient-no-nonstandard-direction': true,
    'selector-pseudo-element-colon-notation': 'double',
    'selector-max-compound-selectors': 2,
    'selector-attribute-quotes': 'always',
    'custom-property-empty-line-before': [
      'always',
      {
        except: ['after-comment', 'after-custom-property', 'first-nested'],
      },
    ],

    'no-descending-specificity': null,
    'scss/at-rule-no-unknown': true,
    'value-keyword-case': ['lower', { ignoreProperties: ['/^--font/', '/^--ion-font/'] }],
  },
};
