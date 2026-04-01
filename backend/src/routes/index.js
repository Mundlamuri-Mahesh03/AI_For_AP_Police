const express = require("express");
const { z } = require("zod");
const auth = require("../middleware/auth");
const ensureUnitScope = require("../middleware/accessScope");
const authorizeRole = require("../middleware/authorizeRole");
const authController = require("../modules/auth/auth.controller");
const unitController = require("../modules/policeUnit/policeUnit.controller");
const { importUnitsFromExcel } = require("../modules/policeUnit/excelImport.service");
const usersController = require("../modules/users/users.controller");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "Backend is healthy" });
});

router.get("/debug/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/debug/jwt-test", (req, res) => {
  const jwt = require("jsonwebtoken");
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.json({ success: false, message: "No token provided" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ 
      success: true, 
      decoded,
      secret: process.env.JWT_SECRET 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message,
      secret: process.env.JWT_SECRET
    });
  }
});

router.post("/auth/login", authController.login);

router.use(auth);

router.get("/police-units/tree", unitController.getTree);
router.get("/police-units/:id", ensureUnitScope, unitController.getById);
router.get("/police-units/:id/descendants", ensureUnitScope, unitController.getDescendants);
router.post("/police-units", ensureUnitScope, unitController.create);
router.patch("/police-units/:id", ensureUnitScope, unitController.update);
router.delete("/police-units/:id", ensureUnitScope, unitController.remove);
router.get("/me/unit-scope", unitController.getMyScope);
router.get("/users", authorizeRole("ADMIN"), usersController.list);
router.post("/users", authorizeRole("ADMIN"), usersController.create);

router.post("/police-units/import/excel", async (req, res, next) => {
  try {
    const schema = z.object({ filePath: z.string().min(1) });
    const { filePath } = schema.parse(req.body);
    const result = await importUnitsFromExcel(filePath);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
