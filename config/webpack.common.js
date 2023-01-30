module.exports = {
  entry: {
    bulk_send_message: './js/bulk_send_message.js',
    auto_combine_suggest: './js/auto_combine_suggest.js',
    oauth_redirect: './js/oauth_redirect.js',
    site_selection: './js/site_selection.js',
    auth_test: './js/auth_test.js',
  },
  output: {
    path: `${__dirname}/../js/dist`,
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: "defaults" }] //https://browsersl.ist/#q=defaults
            ]
          }
        }
      }
    ]
  }
};