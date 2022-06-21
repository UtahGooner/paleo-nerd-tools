const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: {
        main: './src/index.ts'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    optimization: {
        minimize: false
    },
    output: {
        path: path.resolve(__dirname, './build'),
        filename: "index.js",
    },
    mode: 'production',
    // devtool: 'hidden-source-map'
}
