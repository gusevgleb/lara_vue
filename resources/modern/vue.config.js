module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  devServer: {
    host: "localhost",
    disableHostCheck: true,
      proxy: {
          "^/api/": {
              target: "http://127.0.0.1:8000",
              pathRewrite: { "^/api/": "/api/" },
              changeOrigin: true,
              logLevel: "debug"
          }
      }
  },
  runtimeCompiler: true,
  publicPath: "/",
  outputDir: "../public",
}
