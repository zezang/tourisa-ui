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

const moduleExtensions = [
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
  const extension = moduleExtensions.find(extension => fs.existsSync(resolveFn(`${filePath}.${extension}`)));

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  };

  return resolveFn(`${filePath}.js`)
};

module.exports = {
  dotenv: resolveApp(".env"),
  root: resolveApp("."),
  appBuild: resolveApp("build"),
  appPublic: resolveApp("public"),
  appHtml: resolveApp("public/index.html"),
  appIndexJs: resolveApp("src/index"),
  appPackageJson: resolveApp("package.json")
}