const AppError = require("../utils/appError");

function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }
    return next();
  };
}

module.exports = authorizeRole;
