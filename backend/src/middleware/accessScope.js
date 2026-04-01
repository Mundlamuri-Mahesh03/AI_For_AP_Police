const AppError = require("../utils/appError");
const policeUnitRepository = require("../modules/policeUnit/policeUnit.repository");

async function ensureUnitScope(req, res, next) {
  try {
    if (req.user.role === "ADMIN") {
      return next();
    }

    const targetUnitId = Number(req.params.id || req.body.policeUnitId || req.body.parentId);
    if (!targetUnitId) {
      return next();
    }

    const allowedIds = await policeUnitRepository.getDescendantIds(req.user.policeUnitId);
    allowedIds.push(req.user.policeUnitId);
    if (!allowedIds.includes(targetUnitId)) {
      throw new AppError("Forbidden: outside of your unit scope", 403);
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = ensureUnitScope;
