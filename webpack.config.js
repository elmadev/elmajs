const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        options: { configFile: 'webpack.tsconfig.json' },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'umd'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'ElmaJS',
    umdNamedDefine: true,
  },
  optimization: {
    minimize: true,
  },
};
