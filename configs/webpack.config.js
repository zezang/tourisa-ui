"use strict"

const fs = require("fs");
const path = require("path");
const paths = require("./paths");

const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const cssRegex = /\.css$/;
const sassRegex = /\.(scss|sass)$/;

module.exports = ((env) => {
  const isProduction = env === "production";
  const isDevelopment = env !== "production";
  const shouldRunBundleAnalyzer = process.argv.includes("--analyzer");

  const getStyleLoaders = (cssOptions, preprocessor) => {
    const loaders = [
      isDevelopment && require.resolve("style-loader"),
      isProduction && {
        loader: MiniCssExtractPlugin.loader,
        options: paths.publicUrlOrPath.startsWith(".") ? { publicPath: "../../" } : {},
      },
      {
        loader: require.resolve("css-loader"),
        options: cssOptions,
      },
      {
        loader: require.resolve("postcss-laoder"),
        options: {

        },
      },
    ].filter(Boolean);

  };

  return {
    // Entry point for the application. Should be *root/src/index.[js|ts]
    entry: paths.appIndexJs,
    output: {
      // Path to build folder
      path: paths.appBuild,
      filename: isProduction ? "static/js/[name].[contenthash:8].js" : "static/js/bundle.js",
      chunkFilename: isProduction ? "static/js/[name].[contenthash:8].chunk.js" : "static/js/[name].chunk.js",
      publicPath: paths.publicUrlOrPath,
    },
    mode: isProduction ? "production" : "development",
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          compress: {
            ecma: 5,
            comparisons: false,
            inline: 2,
            warnings: false,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        }),
        new CssMinimizerPlugin(),
      ],
    },
  };
});

const res = module.exports();
console.log(res)