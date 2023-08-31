"use strict";

const fs = require("fs");
const evalSourceMapMiddlware = require("react-dev-utils/evalSourceMapMiddleware");
const ignoredFiles = require("react-dev-utils/ignoredFiles");
const noopServiceWorkerMiddlware = require("react-dev-utils/noopServiceWorkerMiddleware");
const redirectServedPath = require("react-dev-utils/redirectServedPathMiddleware");

const getHttpsConfig = require("./getHttpsConfig");
const paths = require("./paths");

const host = process.env.HOST || "0.0.0.0";

module.exports = function(proxy, allowedHost) {
  return {
    allowedHosts: proxy ? [allowedHost] : "all",
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
    },
    devMiddleware: {
      publicPath: paths.publicUrlOrPath.slice(0, -1),
    },
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath,
    },
    host,
    https: getHttpsConfig(),
    static: {
      directory: paths.appPublic,
      publicPath: [paths.publicUrlOrPath],
      watch: {
        ignored: ignoredFiles(paths.appSrc),
      },
    },
    proxy,
    setupMiddlewares(middlewares, devServer) {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }

      if (fs.existsSync(paths.proxySetup)) {
        require(paths.proxySetup)(devServer.app)
      }

      middlewares.unshift(
        evalSourceMapMiddlware(devServer),
        redirectServedPath(paths.publicUrlOrPath),
        noopServiceWorkerMiddlware(paths.publicUrlOrPath),
      );

      return middlewares;
    },
  };
};