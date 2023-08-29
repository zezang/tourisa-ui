"use strict";

const fs = require("fs");
const path = require("path");
const paths = require("./paths");
const chalk = require("react-dev-utils/chalk");
const resolve = require("resolve");


/**
 * Get additional module paths based on the baseUrl of a compilerOptions object
 * @param {Object} options
 */
function getAdditionalModulePaths(options = {}) {
  const baseUrl = options.baseUrl;

  if (!baseUrl) {
    return "";
  }

  const resolvedBaseUrl = path.resolve(paths.root, baseUrl);

  if (path.relative(paths.appNodeModules, resolvedBaseUrl) === "") {
    return null;
  }

  if (path.relative(paths.appSrc, resolvedBaseUrl) === "") {
    return [paths.appSrc];
  }

  if (paths.relative(paths.root, resolvedBaseUrl) === "") {
    return null;
  }

  throw new Error(
    chalk.red.bold(
      "Your project's `baseUrl` can only be set to `src` or `node_modules."
    )
  );
}

/** 
 * Get webpack aliases baed on baseUrl of a compilerOptions object
 *
 * @param {*} options
 */
function getWebpackAliases(options = {}) {
  const baseUrl = options.baseUrl;

  if (!baseUrl) {
    return {};
  }

  const resolvedBaseUrl = path.resolve(paths.root, baseUrl);

  if (path.relative(paths.root, resolvedBaseUrl) === "") {
    return {
      src: paths.appSrc,
    };
  }
}

/** 
 * Get jest aliases based on baseUrl of a compilerOptions object
 * 
 * @param {*} options
 */
function getJestAliases(options = {}) {
  const baseUrl = options.baseUrl;

  if (!baseUrl) {
    return {};
  }

  const resolvedBaseUrl = path.resolve(paths.root, baseUrl);

  if (path.relative(paths.root, resolvedBaseUrl) === "") {
    return {
      '^src/(.*)$': '<rootDir>/src/$1',
    };
  }
}

function getModules() {
  const hasTsConfig = fs.existsSync(paths.appTsConfig);
  const hasJsConfig = fs.existsSync(paths.appJsConfig);

  if (hasTsConfig && hasJsConfig) {
    throw new Error(
      "You have both a tsconfig.json and a jsconfig.json. Please use only one of the two."
    );
  }

  let config;

  if (hasTsConfig) {
    const ts = require(resolve.sync("typescript", {
      basedir: paths.appNodeModules,
    }));
    config = ts.readConfigFile(paths.appTsConfig, ts.sys.readFile).config;
  } else if (hasJsConfig) {
    config = require(paths.appJsConfig);
  }

  config = config || {};
  const options = config.compilerOptions || {};

  const additionalModulePaths = getAdditionalModulePaths(options);
  const webpackAliases = getWebpackAliases(options);
  const jestAliases = getJestAliases(options);

  return {
    additionalModulePaths,
    webpackAliases,
    jestAliases,
    hasTsConfig,
  };
}

module.exports = getModules();