const { NxAppWebpackPlugin } = require("@nx/webpack/app-plugin");
const { join, resolve } = require("path");

module.exports = {
  resolve: {
    alias:{
      "@packages": resolve(__dirname, "../../packages")
    },
    extensions: [".ts", ".js"]
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: "node",
      compiler: "tsc",
      main: "./src/main.ts",
      tsConfig: "./tsconfig.app.json",
      optimization: false,
      outputHashing: "none",
      generatePackageJson: true,
      outputFileName: "main.js"
    }),
  ],
};