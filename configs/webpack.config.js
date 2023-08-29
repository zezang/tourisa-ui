"use strict"

const fs = require("fs");
const resolve = require("resolve");
const webpack = require("webpack");

const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CspHtmlWebpackPlugin = require("csp-html-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const getClientEnvironment = require("./env");
const { getCSPScriptSrc } = require("./csp/index");
const paths = require("./paths");

const useTypeScript = fs.existsSync(paths.appTsConfig);
const imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || "10000");

const cssRegex = /\.css$/;
const sassRegex = /\.(scss|sass)$/;
const nodeModulesRegex = /node_modules/;

module.exports = ((env) => {
  const isProduction = env === "production";
  const isDevelopment = env !== "production";
  const shouldRunBundleAnalyzer = process.argv.includes("--analyzer");

  const envKeys = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

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
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          }
        },
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          include: paths.appSrc,
          exclude: nodeModulesRegex,
          loader: require.resolve("babel-loader"),
          options: {
            babelrc: false,
            presets: [require.resolve("@babel/preset-env"), require.resolve("@babel/preset-react")],
            plugins: [
              require.resolve("@babel/plugin-transform-runtime"),
              [
                "relay", 
                { 
                  artifactDirectory: "./src/__generated__", 
                },
              ],
            ].filter(Boolean),
            // Cache related options
            cacheDirectory: true,
            cacheCompression: false,
            compact: isProduction,
          },
        },
        {
          test: cssRegex,
          exclude: nodeModulesRegex,
          use: getStyleLoaders({
            importLoaders: 1,
            sourceMap: isDevelopment,
            modules: {
              mode: "icss",
            },
          }),
          sideEffects: true,
        },
        {
          test: sassRegex,
          exclude: nodeModulesRegex,
          use: getStyleLoaders(
            {
              importLoaders: 3,
              sourceMap: isDevelopment,
            },
            "sass-loader",
          ),
        },
        {
          test: /\.(bmp|gif|jpe?g|png)$/,
          type: "asset",
          parser: {
            dataUrlCondition: {
              maxSize: imageInlineSizeLimit,
            },
          },
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: require.resolve("@svgr/webpack"),
              options: {
                prettier: false,
                svgo: false,
                svgoConfig: {
                  plugions: [{ removeViewBox: false }],
                },
                titleProp: true,
                ref: true,
              },
            },
            {
              loader: require.resolve("file-loader"),
              options: {
                name: "static/media/[name].[hash].[ext]",
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.appHtml,
          },
          isProduction ? {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useshortDoctype: true,
              removeEmptyAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLS: true,
            },
          }
          : undefined,
        ),
      ),

      // Content Security Policy configs
      new CspHtmlWebpackPlugin(
        {
          "default-src": "'self'",
          "script-src": getCSPScriptSrc(),
        },
        {
          hashEnabled: {
            "style-src": false,
          },
          nonceEnabled: {
            "style-src": false,
          },
        },
      ),

      new BundleAnalyzerPlugin({
        analyzerMode: shouldRunBundleAnalyzer ? "static" : "disabled",
      }),
      // Makes environment variables available to JS code
      new webpack.DefinePlugin(envKeys.stringified),

      new ESLintPlugin({
        failOnError: false,
        emitWarning: true,
        extensions: ["js", "mjs", "jsx", "ts", "tsx"],
        formatter: require.resolve("react-dev-utils/eslintFormatter"),
        eslintPath: require.resolve("eslint"),
        context: paths.appSrc,
        cache: true,
        cwd: paths.root,
        resolvePluginsRelativeTo: __dirname,
        baseConfig: {
          extends: [require.resolve("eslint-config-react-app/base")],
        },
      }),

      useTypeScript && new ForkTsCheckerWebpackPlugin({
        async: isDevelopment,
        typescript: {
          typescriptPath: resolve.sync("typescript", {
            baseDir: paths.appNodeModules,
          }),
          configOverwrite: {
            compilerOptions: {
              sourceMap: isDevelopment,
              skipLibCheck: true,
              inlineSourceMap: false,
              declarationMap: false,
              incremental: true,
              tsBuildInfoFile: paths.appTsBuildInfoFile,
            },
          },
          context: paths.root,
          mode: "write-references",
          diagnosticOptions: {
            syntactic: true,
          },
        },
      }),

      isProduction && new MiniCssExtractPlugin({
        filename: "static/css/[name].[contenthash:8].css",
        chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
        ignoreOrder: true,
      }),
    ].filter(Boolean),
  };
});