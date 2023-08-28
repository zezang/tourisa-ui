"use strict"

const fs = require("fs");
const path = require("path");
const getPublicUrlOrPath = require("react-dev-utils/getPublicUrlOrPath");

// Get current directory
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const publicUrlOrPath = getPublicUrlOrPath(
  process.NODE_ENV === "development",
  require(resolveApp("package.json")).homepage,
  process.env.PUBLIC_URL
);

const moduleFileExtensions = [
  "mjs",
  "web.mjs",
  "js",
  "web.js",
  "ts",
  "web.ts",
  "tsx",
  "web.tsx",
  "jsx",
  "web.jsx",
  "json",
];

const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension => fs.existsSync(resolveFn(`${filePath}.${extension}`)));

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  };

  return resolveFn(`${filePath}.js`)
};

module.exports = {
  root: resolveApp("."),
  dotenv: resolveApp(".env"),
  appBuild: resolveApp("build"),
  appPublic: resolveApp("public"),
  appHtml: resolveApp("public/index.html"),
  appIndexJs: resolveApp("src/index"),
  appPackageJson: resolveApp("package.json"),
  appSrc: resolveApp("src"),
  appTsConfig: resolveApp("tsconfg.json"),
  appJsConfig: resolveApp("jsconfig.json"),
  appMutations: resolveApp("src/mutations"),
  appNodeModules: resolveApp("node_modules"),
  appNodeModulesCache: resolveApp("node_modules/cache"),
  appProviders: resolveApp("src/providers"),
  appTsBuildInfoFile: resolveApp("node_modules/.cache/tsconfig.tsbuildinfo"),
  proxySetup: resolveApp("src/setupProxy.js"),
  yarnLockFile: resolveApp("yarn.lock"),
  moduleFileExtensions,
  publicUrlOrPath,
};