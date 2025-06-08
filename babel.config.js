module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'react-native-reanimated/plugin',
        {
          relativeSourceLocation: true,
          absolute: true,
          legacy: false,
          largeListRefactor: false,
          debug: false,
          optimize: true,
          disableCreateAnimatedComponent: false,
          disableLayoutAnimations: false,
        },
      ],
    ],
  };
};