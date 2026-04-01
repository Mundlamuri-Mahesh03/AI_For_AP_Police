const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma");
const AppError = require("../../utils/appError");

async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { policeUnit: true }
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, policeUnitId: user.policeUnitId },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      policeUnitId: user.policeUnitId,
      policeUnit: user.policeUnit
    }
  };
}

module.exports = { login };
