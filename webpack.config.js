/**
 * Created by kalle on 04.01.2016.
 */
const Path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const Common = {
    plugins: [
        //new HtmlWebpackPlugin({
        //    title: 'Webpack demo'
        //})
    ],
    module: {
        loaders: [
            {
                test: /\.(js|jsx|es6)$/,  //All .js and .jsx files //test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    }
};

let config;
// Detect how npm is run and branch based on that
switch (process.env.npm_lifecycle_event) {
    case 'build':
        config = merge(Common, {
            entry: [
                Path.resolve(__dirname, 'src/FileStorage.jsx')
            ],
            output: {
                path: Path.resolve(__dirname, 'lib'),
                filename: 'file_storage.js'
            }
        });
        break;
    default:
        config = merge(Common, {
            entry: [
                'webpack/hot/dev-server',
                Path.resolve(__dirname, 'example/src/app/app.jsx'),
            ],
            output: {
                path: Path.resolve(__dirname, 'lib'),
                //publicPath: 'http://localhost:8001/example',
                filename: 'example.js'
            }
        });
        break;
}

module.exports = config;
