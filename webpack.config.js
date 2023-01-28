module.exports = {
  entry: {
    bulk_send_message: './js/bulk_send_message.js',
    auto_combine_suggest: './js/auto_combine_suggest.js'
  },
  mode: 'development',
  output: {
    path: `${__dirname}/js/dist`,
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: "defaults" }]
            ]
          }
        }
      }
    ]
  }
};