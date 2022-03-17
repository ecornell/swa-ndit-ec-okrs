const webpack = require('webpack');
module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  runtimeCompiler: true,
  configureWebpack: {
    devtool: 'source-map',
    plugins: [
      new webpack.EnvironmentPlugin({
        'COMMIT_HASH': JSON.stringify(require('child_process').execSync('git rev-parse --short HEAD').toString('utf-8').trim()),
      })
    ]
  }
}