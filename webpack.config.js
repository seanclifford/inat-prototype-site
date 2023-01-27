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
};