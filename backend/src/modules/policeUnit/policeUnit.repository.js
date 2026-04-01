const prisma = require("../../lib/prisma");

function create(data) {
  return prisma.policeUnit.create({ data });
}

function update(id, data) {
  return prisma.policeUnit.update({ where: { id }, data });
}

function remove(id) {
  return prisma.policeUnit.delete({ where: { id } });
}

function findById(id) {
  return prisma.policeUnit.findUnique({
    where: { id },
    include: { parent: true, children: true }
  });
}

function findByCode(code) {
  return prisma.policeUnit.findUnique({ where: { code } });
}

function findAll() {
  return prisma.policeUnit.findMany({
    orderBy: [{ parentId: "asc" }, { name: "asc" }]
  });
}

async function getDescendantIds(unitId) {
  const rows = await prisma.$queryRaw`
    WITH RECURSIVE unit_tree AS (
      SELECT id, parentId FROM PoliceUnit WHERE id = ${unitId}
      UNION ALL
      SELECT child.id, child.parentId
      FROM PoliceUnit child
      INNER JOIN unit_tree t ON child.parentId = t.id
    )
    SELECT id FROM unit_tree WHERE id <> ${unitId}
  `;
  return rows.map((row) => Number(row.id));
}

async function hasChildren(id) {
  const count = await prisma.policeUnit.count({ where: { parentId: id } });
  return count > 0;
}

module.exports = {
  create,
  update,
  remove,
  findById,
  findByCode,
  findAll,
  hasChildren,
  getDescendantIds
};
