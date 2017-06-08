var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './app/main.jsx',
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: '/bdsi/',
        filename: 'app.bundle.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            PUB_STEM: JSON.stringify("/bdsi/")
            //PUB_STEM: JSON.stringify("/")
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
        loaders: [
            {
                test: /\.jsx$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
}
