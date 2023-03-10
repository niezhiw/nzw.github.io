const path = require('path');

module.exports = {
  entry: './webmain.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  devtool: 'source-map'
};
