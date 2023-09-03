"use strict";

const createConfig = require("../configs/webpack.config");
const createDevServerConfig = require("../configs/webpackDevServer.config");
const {
  choosePort,
  createCompiler,
  prepareUrls,
  prepareProxy,
} = require("react-dev-utils/WebpackDevServerUtils");
const paths = require("../configs/paths");


const HOST = process.env.HOST || "0.0.0.0";
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

const urls = prepareUrls("http", HOST, DEFAULT_PORT);
const proxySettings = require(paths.appPackageJson).proxy;
const proxyConfig = prepareProxy(proxySettings, paths.appPublic, paths.publicUrlOrPath)

const webpackConfig = createConfig("developement");
const serverConfig = {
  ...createDevServerConfig(proxyConfig, urls.lanUrlForConfig),
  host: HOST,
  port: DEFAULT_PORT,
}

function logWebpackConfigInfo(config) {
  if (!config) {
    return;
  }

  console.log("webpack config info: ", config);
  console.log("\n");
  console.log("webpack config plugins: ", config.plugins);
  console.log("\n");
  
  if (config.module) {
    logWebpackConfigRules(config.module.rules);
  }
}

function logWebpackDevServerInfo(serverConfig) {
  if (!serverConfig) {
    return;
  }

  console.log("webpack-dev-server: ", serverConfig)
}

function logWebpackConfigRules(configRules) {
  if (!configRules) {
    return;
  }

  let ruleObj;
  for (ruleObj of configRules) {
    if ("oneOf" in ruleObj) {
      const ruleArray = ruleObj["oneOf"];

      for (const rule of ruleArray) {
        if ("use" in rule) {
          console.log(rule.use);
        } else {
          console.log(rule);
        }
        console.log("\n");
      }
    }
  }
}



module.exports = {
  logWebpackConfigInfo: () => logWebpackConfigInfo(webpackConfig),
  logWebpackDevServerInfo: () => logWebpackDevServerInfo(serverConfig),
};