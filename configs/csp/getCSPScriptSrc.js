const { devHosts } = require("./shared");

const GOOGLE_URLS = [
  "https://www.google-analytics.com",
  "https://maps.googleapis.com",
];

const UNSAFE_EVAL = ["'unsafe-eval'"];

const ALLOWED_SCRIPT_SOURCES = [
  ...GOOGLE_URLS,
  ...UNSAFE_EVAL,
];

const getCSPScriptSrc = () => {
  const allowedScriptSources = ALLOWED_SCRIPT_SOURCES.join(" ");
  const allowSelf = "'self'";

  const allowedHostsIfDev = devHosts();

  return `${allowSelf} ${allowedScriptSources} ${allowedHostsIfDev}`;
}

module.exports = {
  getCSPScriptSrc,
};