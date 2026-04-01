const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const AppError = require("../utils/appError");

async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error("[AUTH] JWT verification failed:", jwtError.message);
      throw new AppError("Invalid or expired token", 401);
    }

    if (!payload.userId) {
      console.error("[AUTH] Token missing userId:", payload);
      throw new AppError("Invalid token structure", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { policeUnit: true }
    });

    if (!user) {
      console.error(`[AUTH] User not found with id: ${payload.userId}`);
      throw new AppError("User not found", 401);
    }

    console.log(`[AUTH] User authenticated: ${user.email} (${user.role})`);
    req.user = user;
    next();
  } catch (error) {
    if (error.statusCode) {
      // Custom AppError
      next(error);
    } else {
      console.error("[AUTH] Unhandled error:", error.message);
      next(new AppError("Authentication failed", 401));
    }
  }
}

module.exports = auth;
