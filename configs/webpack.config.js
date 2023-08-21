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

  const getStyleLoaders = (cssOptions, preProcessor) => {
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
        loader: require.resolve("postcss-loader"),
        options: {
          postcssOptions: {
            ident: "postcss",
            plugins: [
              "postcss-flexbugs-fixes",
              [
                "postcss-preset-env", 
                { 
                  autoprefixer: { 
                    flexbox: "no-2009" 
                  },
                  stage: 3,
                },
              ],
              // Makes sure default styles are consistent across browsers
              "postcss-normalize",
              // Adds ability to reference assets in scss files from a base path
              // background-image: url(assets/**)
              [
                "postcss-url",
                {
                  basePath: paths.publicUrlOrPath,
                },
              ],
              // Allows use of overflow shorthand syntax such as "overflow: hidden scroll"
              "postcss-overflow-shorthand"
            ],
          },
        },
      },
    ].filter(Boolean);

    if (preProcessor) {
      loaders.push(
        {
          loader: require.resolve("resolve-url-loader"),
          options: {
            soureMap: isDevelopment,
            root: paths.appSrc
          },
        },
        {
          loader: require.resolve(preProcessor),
          options: { sourceMap: true },
        },
      );
    };
  };

  return {
    target: ["browserslist"],
    bail: isProduction,
    devtool: isProduction ? false : "eval",
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
          terserOptions: {
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
          }
        }),
        new CssMinimizerPlugin(),
      ],
    },
  };
});

const res = module.exports();
console.log(res)