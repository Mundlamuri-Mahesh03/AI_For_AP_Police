const XLSX = require("xlsx");
const prisma = require("../../lib/prisma");

function parseFile(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: null });
}

async function importUnitsFromExcel(filePath) {
  const rows = parseFile(filePath);
  const errors = [];

  for (const row of rows) {
    if (!row.unitCode || !row.unitName || !row.unitType) {
      errors.push({ row, reason: "Missing required fields: unitCode, unitName, unitType" });
      continue;
    }
    try {
      await prisma.policeUnit.upsert({
        where: { code: String(row.unitCode) },
        update: {
          name: String(row.unitName),
          type: String(row.unitType),
          parentUnitCode: row.parentUnitCode ? String(row.parentUnitCode) : null
        },
        create: {
          code: String(row.unitCode),
          name: String(row.unitName),
          type: String(row.unitType),
          ministry: row.ministry ? String(row.ministry) : null,
          legacyRef: row.legacyReference ? String(row.legacyReference) : null,
          department: row.department ? String(row.department) : null,
          isVirtual: Boolean(row.isVirtual),
          parentUnitCode: row.parentUnitCode ? String(row.parentUnitCode) : null
        }
      });
    } catch (error) {
      errors.push({ row, reason: error.message });
    }
  }

  const units = await prisma.policeUnit.findMany();
  const byCode = new Map(units.map((unit) => [unit.code, unit.id]));
  for (const unit of units) {
    if (!unit.parentUnitCode) continue;
    const parentId = byCode.get(unit.parentUnitCode);
    if (!parentId) {
      errors.push({ code: unit.code, reason: `Parent code not found: ${unit.parentUnitCode}` });
      continue;
    }
    await prisma.policeUnit.update({
      where: { id: unit.id },
      data: { parentId }
    });
  }

  return {
    totalRows: rows.length,
    rejectedCount: errors.length,
    errors
  };
}

module.exports = { importUnitsFromExcel };
