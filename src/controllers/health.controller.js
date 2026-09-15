const { getHealthStatus } = require("../services/health.service");
const { successResponse } = require("../utils/apiResponse");

const getHealth = (req, res) => {
  const data = getHealthStatus();

  return res.status(200).json(successResponse("Health check success", data));
};

module.exports = { getHealth };
