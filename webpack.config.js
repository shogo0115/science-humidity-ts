// webpack.config.js
const path = require('path');

module.exports = {
  entry: { bundle: './src/index.tsx' },
  output: {
    path: path.join(__dirname, 'dst'),
    filename: '[name].js',
    publicPath: '/',
    clean: true,
  },
  devtool: 'source-map',
  resolve: { extensions: ['.tsx', '.ts', '.js'] },
  devServer: {
  static: { directory: path.join(__dirname, 'public'), watch: true },
  historyApiFallback: true,
  port: 8080,
},
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.css$/,  use: ['style-loader', 'css-loader'] },
    ],
  },
};
