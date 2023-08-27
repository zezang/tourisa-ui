const isEnvDevelopment = process.env.NODE_ENV === "development";

const devHosts = () => {
  if (isEnvDevelopment) {
    const localHost = "localhost:*";

    return localHost;
  };

  return "";
};

module.exports = {
  devHosts,
};