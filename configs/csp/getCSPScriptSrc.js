const { devHosts } = require("./shared");

const GOOGLE_URLS = [
  "https://www.google-analytics.com",
  "https://maps.googleapis.com",
];

const ALLOWED_SCRIPT_SOURCES = [
  ...GOOGLE_URLS,
];

const getCSPScriptSrc = () => {
  const allowedScriptSources = ALLOWED_SCRIPT_SOURCES.join(" ");
  const allowSelf = "self";

  const allowedHostsIfDev = devHosts();

  return `${allowSelf} ${allowedScriptSources} ${allowedHostsIfDev}`;
}

module.exports = {
  getCSPScriptSrc,
};