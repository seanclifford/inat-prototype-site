const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    bulk_send_message: './js/bulk_send_message.js',
    auto_combine_suggest: './js/auto_combine_suggest.js',
    auto_combine_suggest2: './src/auto_combine_suggest2.js',
    oauth_redirect: './js/oauth_redirect.js',
    site_selection: './js/site_selection.js',
    auth_test: './js/auth_test.js',
  },
  output: {
    path: `${__dirname}/../js/dist`,
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(m?js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: "> 0.2%,not dead,not op_mini all" }], //https://browsersl.ist/#q=>+0.2%25,not dead,not op_mini all
              '@babel/preset-react'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template.ejs',
      title: 'iNat prototypes - Auto Combine Observations PROTOTYPE',
      filename: 'auto_combine_suggest2.html',
      chunks: ['auto_combine_suggest2']
    })
  ]
};