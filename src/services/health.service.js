const { env } = require("../config/env");

const getHealthStatus = () => {
  return {
    status: "OK",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString()
  };
};

module.exports = { getHealthStatus };
