const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const PATHS = {
    build: path.resolve(__dirname, 'public')
};

const extractBundleCSS = new MiniCssExtractPlugin({
    filename: 'style/app.css'
});

module.exports = {
    mode: 'production',
    devtool: "sourcemap",
	context: path.resolve(__dirname),
	entry: {
		app: './src/client/index.jsx'
	},
	output: {
		path: PATHS.build,
		filename: 'js/app.js',
        publicPath: "/"
	},
	resolve: {
		extensions: ['.js', '.jsx', '.scss'],
        modules: ["node_modules"],
        alias: {
            "react": "preact-compat",
            "react-dom": "preact-compat",
            "create-react-class": "preact-compat/lib/create-react-class"
        }
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
                        "babel-preset-env",
                        "preact"
                    ]
                }
            }
		]
	},
	plugins: [
        extractBundleCSS
	]
};