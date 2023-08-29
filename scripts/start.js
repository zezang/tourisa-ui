"use strict";

// Set the env to development
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

// Makes the script crash on unhandled rejection instead of silently ignoring
process.on("unhandledRejection", (err) => {
  throw err;
});

// Read environment variables
require("../configs/env");

const fs = require("fs");
const chalk = require("react-dev-utils/chalk");
const clearConsole = require("react-dev-utils/clearConsole");
const checkRequiredFiles = require("react-dev-utils/checkRequiredFiles")
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require("react-dev-utils/WebpackDevServerUtils");
const openBrowser = require("react-dev-utils/openBrowser");
const semver = require("semver");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");

const createWebpackDevServerConfig = require("../configs/webpackDevServer.config");
const createWebpackConfig = require("../configs/webpack.config");
const getClientEnvironment = require("../configs/env");
const paths = require("../configs/paths");
const react = require(require.resolve("react", { paths: [paths.root] }));

const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));
const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;


// Warn and crash if files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

// Set host and port
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind HOST environment variable: ${chalk.yellow(chalk.bold(process.env.HOST))}`
    ),
  );
}

const { checkBrowsers } = require("react-dev-utils/browsersHelper");
checkBrowsers(paths.root, isInteractive)
  .then(() => choosePort(HOST, DEFAULT_PORT))
  .then((port) => {
    if (port == null) {
      return;
    }

    const config = createWebpackConfig(process.env.NODE_ENV);
    const protocol = process.env.HTTPS === "true" ? "https" : "http";
    const appName = require(paths.appPackageJson).name;

    console.log("created webpack config: ", config);

    const useTypeScript = fs.existsSync(paths.appTsConfig);
    const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === "true";
    const urls = prepareUrls(protocol, HOST, port, paths.publicUrlOrPath.slice(0, -1));
    const devSocket = {
      warnings: (warnings) => devServer.sendMessage(devServer.sockets, "warnings", warnings),
      errors: (errors) => devServer.sendMessage(devServer.sockets, "errors", errors),
    };

    // Create compiler
    const compiler = createCompiler({
      appName,
      config,
      devSocket,
      urls,
      useYarn,
      useTypeScript,
      tscCompileOnError,
      webpack,
    });

    console.log(`Successfully created compiler: ${compiler}\n`);

    // Load proxy configs
    const proxySettings = require(paths.appPackageJson).proxy;
    const proxyConfig = prepareProxy(proxySettings, paths.appPublic, paths.publicUrlOrPath);

    // Create webpack dev server configuration
    const serverConfig = {
      ...createWebpackDevServerConfig(proxyConfig, urls.lanUrlForConfig),
      host: HOST,
      port,
    };
    const devServer = new WebpackDevServer(compiler, serverConfig);

    devServer.startCallback(() => {
      if (isInteractive) {
        clearConsole();
      }

      if (env.raw.FAST_REFRESH && semver.lt(react.version, "16.10.0")) {
        console.log(
          chalk.yellow(
            `Fast refresh requires React 16.10 or higher. You are using React ${react.version}.`
          )
        );
      }

      console.log(chalk.cyan("Starting the development server..."));
      openBrowser(urls.lanUrlForConfig);
    });
  });

["SIGINT", "SIGTERM"].forEach((sig) => {
  process.on(sig, () => {
    devServer.close();
    process.exit();
  });
});
