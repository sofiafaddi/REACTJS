// Command line:
// webpack app/app.js dist/bundle.js --module-bind 'js=babel-loader'

// In webpack.config.js
var HtmlWebpackPlugin = require('html-webpack-plugin')
var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
    template: __dirname + '/index.html',
    filename: 'dist/index.html',
    inject: 'body'
});
module.exports = {
    entry: [
        './app/app.js'
    ],
    output: {
        path: __dirname,
        filename: "dist/bundle.js"
    },
    module: {
        loaders: [
            {test: /\.js$/, include: __dirname + '/app', loader: "babel-loader", query: {
                presets: ['es2015']
            }}
        ]
    },
    plugins: [HTMLWebpackPluginConfig]
};