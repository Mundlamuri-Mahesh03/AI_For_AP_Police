const { z } = require("zod");
const bcrypt = require("bcryptjs");
const prisma = require("../../lib/prisma");

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "OFFICER"]).default("OFFICER"),
  policeUnitId: z.number().int()
});

async function create(req, res, next) {
  try {
    const payload = createUserSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        passwordHash,
        role: payload.role,
        policeUnitId: payload.policeUnitId
      }
    });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      include: { policeUnit: true },
      orderBy: { id: "asc" }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list };
