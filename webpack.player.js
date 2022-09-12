const webpack = require("webpack");
const path = require("path");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'none',
  context: path.resolve(__dirname),
  entry: {
    "hls.plugins": "./src/player/hls_player",
    "fairplay": "./src/player/fairplay_player",
  },
  externals: {
    "video.js": "videojs"
  },
  output: {
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.jsx|\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
            babelrc: false,
            presets: [
              "@babel/preset-env"
            ]
        }
    }
    ]
  },
  optimization: {
    minimizer: [new UglifyJsPlugin({
        uglifyOptions: {
          output: {
            comments: false,
          },
        },
      })]
  },
  plugins: [
    new webpack.optimize.AggressiveMergingPlugin()
  ]
};
