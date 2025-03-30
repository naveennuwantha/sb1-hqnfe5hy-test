module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['next/babel', {
        'preset-env': {
          targets: {
            node: 'current',
          },
          modules: false
        },
      }],
      '@babel/preset-flow'
    ],
    plugins: [
      ['react-native-web', { commonjs: false }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
      '@babel/plugin-transform-flow-strip-types'
    ],
  };
}; 