const { z } = require("zod");
const service = require("./policeUnit.service");

const baseSchema = z.object({
  ministry: z.string().optional(),
  name: z.string().min(2),
  code: z.string().min(2),
  legacyRef: z.string().optional(),
  type: z.enum([
    "ZONE",
    "RANGE",
    "DISTRICT",
    "CIRCLE",
    "SDPO",
    "PS",
    "COMMISSIONERATE",
    "CPO",
    "DCPO",
    "ACPO"
  ]),
  department: z.string().optional(),
  isVirtual: z.boolean().optional(),
  parentId: z.number().int().nullable().optional(),
  parentUnitCode: z.string().optional()
});

const createSchema = baseSchema;
const updateSchema = baseSchema.partial();

async function create(req, res, next) {
  try {
    const payload = createSchema.parse(req.body);
    const data = await service.createPoliceUnit(payload);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const payload = updateSchema.parse(req.body);
    const data = await service.updatePoliceUnit(Number(req.params.id), payload);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await service.deletePoliceUnit(Number(req.params.id));
    res.json({ success: true, message: "Unit deleted successfully" });
  } catch (error) {
    next(error);
  }
}

async function getTree(req, res, next) {
  try {
    const data = await service.getTree();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const data = await service.getUnit(Number(req.params.id));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getDescendants(req, res, next) {
  try {
    const data = await service.getDescendants(Number(req.params.id));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getMyScope(req, res, next) {
  try {
    const data = await service.getScopeForUser(req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = { create, update, remove, getTree, getById, getDescendants, getMyScope };
