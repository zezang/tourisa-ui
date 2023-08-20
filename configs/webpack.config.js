"use strict"

const fs = require("fs");
const path = require("path");

module.exports = ((env) => {
  const isProduction = env === "production";

  return {
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "bundle.js",
      publicPath: "/",
    }
  };
});