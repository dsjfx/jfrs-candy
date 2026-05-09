module.exports = {
  // 停止在父级目录中寻找配置文件
  root: true,

  // 指定代码运行环境
  env: {
    browser: true,
    es2021: true,
    node: true,
    // 启用 Vue 3 的 <script setup> 宏
    'vue/setup-compiler-macros': true
  },

  // 全局变量
  globals: {
    // Vue 3 <script setup> 中的编译宏
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
    // 微信小程序全局变量（如果需要）
    wx: 'readonly',
    uni: 'readonly'
  },

  // 扩展配置
  extends: [
    // ESLint 推荐规则
    'eslint:recommended',

    // Vue 3 基础规则
    'plugin:vue/vue3-essential',
    // 或者使用更严格的规则
    // 'plugin:vue/vue3-strongly-recommended',
    // 'plugin:vue/vue3-recommended',

    // TypeScript 推荐规则
    'plugin:@typescript-eslint/recommended',

    // Vue 官方 TypeScript 支持
    '@vue/typescript/recommended',

    // Prettier 集成（必须放在最后）
    '@vue/prettier',
    '@vue/prettier/@typescript-eslint'
  ],

  // 指定解析器
  parser: 'vue-eslint-parser',

  // 解析器选项
  parserOptions: {
    // ECMAScript 版本
    ecmaVersion: 'latest',
    // 指定解析 TypeScript 的解析器
    parser: '@typescript-eslint/parser',
    // 模块类型
    sourceType: 'module',
    // 支持 JSX
    ecmaFeatures: {
      jsx: true
    },
    // 额外支持的文件类型
    extraFileExtensions: ['.vue'],
    // TypeScript 项目配置
    project: ['./tsconfig.json']  // 如果有 tsconfig.json
  },

  // 插件
  plugins: [
    'vue',
    '@typescript-eslint'
  ],

  // 自定义规则
  rules: {
    // ---------- Vue 规则 ----------
    // 关闭组件名必须多个单词的限制
    'vue/multi-word-component-names': 'off',

    // 属性顺序
    'vue/attributes-order': ['error', {
      order: [
        'DEFINITION',
        'LIST_RENDERING',
        'CONDITIONALS',
        'RENDER_MODIFIERS',
        'GLOBAL',
        'UNIQUE',
        'TWO_WAY_BINDING',
        'OTHER_DIRECTIVES',
        'OTHER_ATTR',
        'EVENTS',
        'CONTENT'
      ],
      alphabetical: false
    }],

    // 属性值换行
    'vue/max-attributes-per-line': ['error', {
      singleline: 1,
      multiline: 1
    }],

    // HTML 结束标签
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'always'
    }],

    // 必须使用 kebab-case 的组件名
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],

    // 不允许 v-html（防止 XSS 攻击）
    'vue/no-v-html': 'warn',

    // 自定义事件名必须使用 kebab-case
    'vue/custom-event-name-casing': ['error', 'kebab-case'],

    // props 默认值规则
    'vue/require-default-prop': 'error',

    // props 类型必须定义
    'vue/require-prop-types': 'error',

    // 不允许重复的字段名
    'vue/no-duplicate-attributes': ['error', {
      allowCoexistClass: true,
      allowCoexistStyle: true
    }],

    // script 缩进
    'vue/script-indent': ['error', 2, {
      baseIndent: 1,
      switchCase: 1
    }],

    // ---------- TypeScript 规则 ----------
    // 允许使用 any
    '@typescript-eslint/no-explicit-any': 'off',

    // 未使用的变量警告（允许 _ 开头的变量）
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],

    // 必须提供函数返回值类型
    '@typescript-eslint/explicit-function-return-type': 'off',

    // 必须提供类成员类型
    '@typescript-eslint/explicit-member-accessibility': 'off',

    // 接口名必须 I 开头（可选）
    // '@typescript-eslint/interface-name-prefix': ['error', 'always'],

    // 使用类型断言时必须明确
    '@typescript-eslint/consistent-type-assertions': ['error', {
      assertionStyle: 'as',
      objectLiteralTypeAssertions: 'allow-as-parameter'
    }],

    // 禁止空函数
    '@typescript-eslint/no-empty-function': ['error', {
      allow: ['arrowFunctions', 'functions', 'methods']
    }],

    // 禁止不必要的类型断言
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',

    // 优先使用 const
    'prefer-const': 'error',

    // ---------- 通用规则 ----------
    // 生产环境禁止 console
    'no-console': process.env.NODE_ENV === 'production' ? ['warn', {
      allow: ['warn', 'error']
    }] : 'off',

    // 生产环境禁止 debugger
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    // 必须使用 ===
    'eqeqeq': ['error', 'always'],

    // 禁止 var
    'no-var': 'error',

    // 必须使用分号（可选）
    'semi': ['error', 'always'],

    // 必须使用单引号
    'quotes': ['error', 'single', {
      avoidEscape: true,
      allowTemplateLiterals: true
    }],

    // 缩进（Prettier 会覆盖这个）
    // 'indent': ['error', 2],

    // 逗号风格
    'comma-dangle': ['error', 'only-multiline'],

    // 箭头函数括号
    'arrow-parens': ['error', 'always'],

    // 对象键值对空格
    'key-spacing': ['error', {
      beforeColon: false,
      afterColon: true
    }]
  },

  // 特定文件的覆盖规则
  overrides: [
    {
      // TypeScript 文件
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      rules: {
        '@typescript-eslint/explicit-function-return-type': ['error', {
          allowExpressions: true,
          allowTypedFunctionExpressions: true
        }]
      }
    },
    {
      // Vue 文件
      files: ['*.vue'],
      rules: {
        // 在 Vue 文件中允许未使用的变量（因为模板会使用）
        '@typescript-eslint/no-unused-vars': 'off',
        'no-unused-vars': 'off',
        'vue/max-attributes-per-line': [
          'error',
          {
            singleline: 1,
            multiline: 1
          }
        ]
      }
    },
    {
      // 配置文件（不使用严格规则）
      files: ['*.config.js', '.*rc.js'],
      env: {
        node: true
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off'
      }
    }
  ],

  // 设置
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      },
      alias: {
        map: [
          ['@', './src']
        ],
        extensions: ['.ts', '.js', '.vue', '.json']
      }
    },
    'import/extensions': ['.js', '.ts', '.vue'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
      'vue-eslint-parser': ['.vue']
    }
  }
};