const { getHealthStatus } = require("../services/health.service");
const { successResponse } = require("../utils/apiResponse");

const getHealth = (req, res) => {
  const data = getHealthStatus();

  return res.status(200).json(successResponse("Kiểm tra trạng thái hệ thống thành công", data));
};

module.exports = { getHealth };
