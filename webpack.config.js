module.exports = {
    module: {
        rules: [
            {
                test: /\.csv$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'data/'
                }
            }
        ]
    }
}; 