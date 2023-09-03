"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const chalk = require("react-dev-utils/chalk");
const paths = require("./paths");

//Ensure the certificate and key provided are valid
function validateKeyAndCerts({ cert, key, crtFile, keyFile }) {
  let encrypted;
  try {
    encrypted = crypto.publicEncrypt(cert, Buffer.from("test"));
  } catch(err) {
    throw new Error(`The certificate "${chalk.yellow(crtFile)}" is invalid.\n${err.message}`);
  };

  try {
    crypto.privateDecrypt(key, encrypted);
  } catch(err) {
    throw new Error(`The certificate "${chalk.yellow(keyFile)}" is invalid.\n${err.message}`);
  };
};

// Read env file and throw an error if it doesn't exist
function readEnvFile(file, type) {
  if (!fs.existsSync(file)) {
    throw new Error(
      `You specified ${chalk.cyan(type)} in your env, but the file "${chalk.yellow(file)}" can't be found.`
    )
  }

  return fs.readFileSync(file);
};

// Function to get the HTTPS configuration
function getHttpsConfig() {
  const { SSL_CRT_FILE, SSL_KEY_FILE, HTTPS } = process.env;
  const isHttps = HTTPS === "true";

  if (isHttps && SSL_CRT_FILE && SSL_KEY_FILE) {
    const crtFile = path.resolve(paths.root, SSL_CRT_FILE)
    const keyFile = path.resolve(paths.root, SSL_KEY_FILE);
    const config = {
      cert: readEnvFile(crtFile, "SSL_CRT_FILE"),
      key: readEnvFile(keyFile, "SSL_KEY_FILE"),
    };

    validateKeyAndCerts({
      ...config,
      crtFile,
      keyFile,
    });
    return config;
  };

  return isHttps;
};

module.exports = getHttpsConfig;