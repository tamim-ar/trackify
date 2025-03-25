const path = require('path');

module.exports = {
  entry: './main.js',
  target: 'electron-main',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  devtool: 'source-map'
};
