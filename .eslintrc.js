module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    mocha: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'none' // 统一尾部不加逗号
      }
    ]
  }
};
