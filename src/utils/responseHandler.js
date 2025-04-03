exports.response = (flag, res, statusCode, message, data = null) => {
  if (flag) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
