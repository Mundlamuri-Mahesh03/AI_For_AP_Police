function errorHandler(error, req, res, next) {
  if (error?.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues
    });
  }
  
  console.error("[ERROR]", {
    name: error?.name,
    message: error?.message,
    statusCode: error?.statusCode,
    stack: error?.stack?.split('\n')[0]
  });

  const statusCode = error?.statusCode || 500;
  const message = error?.message || "Internal server error";
  res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = errorHandler;
