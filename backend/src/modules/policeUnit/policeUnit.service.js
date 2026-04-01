const AppError = require("../../utils/appError");
const repository = require("./policeUnit.repository");

function buildTree(units, parentId = null) {
  return units
    .filter((unit) => unit.parentId === parentId)
    .map((unit) => ({
      ...unit,
      children: buildTree(units, unit.id)
    }));
}

async function assertParentIntegrity(parentId, currentUnitId) {
  if (!parentId) return;

  const parent = await repository.findById(parentId);
  if (!parent) {
    throw new AppError("Parent unit not found", 404);
  }

  if (currentUnitId && parentId === currentUnitId) {
    throw new AppError("Unit cannot be parent of itself", 400);
  }

  if (currentUnitId) {
    const descendants = await repository.getDescendantIds(currentUnitId);
    if (descendants.includes(parentId)) {
      throw new AppError("Cyclic hierarchy is not allowed", 400);
    }
  }
}

async function createPoliceUnit(payload) {
  const existing = await repository.findByCode(payload.code);
  if (existing) {
    throw new AppError("A unit with this code already exists", 409);
  }
  await assertParentIntegrity(payload.parentId);
  return repository.create(payload);
}

async function updatePoliceUnit(id, payload) {
  const unit = await repository.findById(id);
  if (!unit) {
    throw new AppError("Police unit not found", 404);
  }
  if (payload.code && payload.code !== unit.code) {
    throw new AppError("Unit code is immutable", 400);
  }
  await assertParentIntegrity(payload.parentId, id);
  return repository.update(id, payload);
}

async function deletePoliceUnit(id) {
  const unit = await repository.findById(id);
  if (!unit) {
    throw new AppError("Police unit not found", 404);
  }
  const hasChildren = await repository.hasChildren(id);
  if (hasChildren) {
    throw new AppError("Cannot delete unit with child units", 400);
  }
  return repository.remove(id);
}

async function getTree() {
  const units = await repository.findAll();
  return buildTree(units, null);
}

async function getUnit(id) {
  const unit = await repository.findById(id);
  if (!unit) {
    throw new AppError("Police unit not found", 404);
  }
  return unit;
}

async function getDescendants(id) {
  const unit = await repository.findById(id);
  if (!unit) {
    throw new AppError("Police unit not found", 404);
  }
  const ids = await repository.getDescendantIds(id);
  const units = await repository.findAll();
  return units.filter((entry) => ids.includes(entry.id));
}

async function getScopeForUser(user) {
  if (user.role === "ADMIN") {
    const tree = await getTree();
    return { rootUnitId: null, tree };
  }

  const ids = await repository.getDescendantIds(user.policeUnitId);
  ids.push(user.policeUnitId);
  const units = await repository.findAll();
  const scoped = units.filter((unit) => ids.includes(unit.id));
  return { rootUnitId: user.policeUnitId, tree: buildTree(scoped, user.policeUnitId) };
}

module.exports = {
  createPoliceUnit,
  updatePoliceUnit,
  deletePoliceUnit,
  getTree,
  getUnit,
  getDescendants,
  getScopeForUser
};
