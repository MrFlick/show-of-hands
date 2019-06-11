var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var config = require("./config")

var publicPath = config.publicPath || "/";

module.exports = {
    entry: './app/main.jsx',
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: publicPath,
        filename: 'app.bundle.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            PUB_STEM: JSON.stringify(publicPath)
        }),
        new HtmlWebpackPlugin({
            template: 'app/template.html',
            inject: 'body',
            filename: 'index.html'
        })
    ],
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                use: {
                    loader: 'babel-loader',
                    options: { 
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: ['@babel/plugin-proposal-class-properties']
                    }
                }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
}
