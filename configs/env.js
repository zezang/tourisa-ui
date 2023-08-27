const fs = require("fs");
const path = require("path");
const paths = require("./paths");

console.log(process.env);
// Ensures that including path.js after env.js will read .env variables
delete require.cache[require.resolve("./paths")];

const { NODE_ENV } = process.env;
if (!NODE_ENV) {
  throw new Error("The NODE_ENV environment variable is required but was not set");
};

const dotenvFiles = [
  paths.dotenv,
  `${paths.dotenv}.local`
  `${paths.dotenv}.${NODE_ENV}`,
  `${paths.dotenv}.${NODE_ENV}.local`,
].filter(Boolean);

dotenvFiles.forEach((envFilePath) => {
  if (fs.existsSync(envFilePath)) {
    require("dotenv-expand")(
      require("dotenv").config({
        path: envFilePath,
      }),
    );
  };
});

// Creates the NODE_PATH concatenated string, which ensures that the environment has access to the node command
const appDirectory = fs.realpathSync(process.cwd());
process.env.NODE_PATH = (process.env.NODE_PATH || "")
  .split(path.delimiter)
  .filter(folder => folder && !path.isAbsolute(folder))
  .map(folder => path.resolve(appDirectory, folder))
  .join(path.delimiter);

// Gives project access to process.env 
function getClientEnvironment(publicUrl) {
  const raw = Object.keys(process.env)
    .reduce((env, key) => {
      env[key] = process.env[key];
      return env;
    },
    {
      NPM_PACKAGE_VERSION: process.env.npm_package_version || "unknown",
      NODE_ENV: process.env.node_env || "development",
      PUBLIC_URL: publicUrl,
      FAST_REFRESH: process.env.FAST_REFRESH || "false",
    },
  );

  const stringified = {
    "process.env": Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };

  return { raw, stringified };
};

module.exports = getClientEnvironment;