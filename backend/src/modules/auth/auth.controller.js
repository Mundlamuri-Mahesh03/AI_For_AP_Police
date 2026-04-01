const { z } = require("zod");
const authService = require("./auth.service");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

async function login(req, res, next) {
  try {
    const payload = loginSchema.parse(req.body);
    const data = await authService.login(payload.email, payload.password);
    res.json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
}

module.exports = { login };
