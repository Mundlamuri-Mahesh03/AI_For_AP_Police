require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient, Role, UnitType } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const zone = await prisma.policeUnit.upsert({
    where: { code: "ZONE-HYD" },
    update: {},
    create: {
      code: "ZONE-HYD",
      name: "Hyderabad Zone",
      type: UnitType.ZONE,
      ministry: "HOME"
    }
  });

  const district = await prisma.policeUnit.upsert({
    where: { code: "DIST-HYD-CENTRAL" },
    update: {},
    create: {
      code: "DIST-HYD-CENTRAL",
      name: "Hyderabad Central District",
      type: UnitType.DISTRICT,
      parentId: zone.id
    }
  });

  const ps = await prisma.policeUnit.upsert({
    where: { code: "PS-ABIDS" },
    update: {},
    create: {
      code: "PS-ABIDS",
      name: "Abids PS",
      type: UnitType.PS,
      parentId: district.id
    }
  });

  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const officerPasswordHash = await bcrypt.hash("Officer@123", 10);

  await prisma.user.upsert({
    where: { email: "admin@appolice.local" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@appolice.local",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      policeUnitId: zone.id
    }
  });

  await prisma.user.upsert({
    where: { email: "officer@appolice.local" },
    update: {},
    create: {
      name: "Field Officer",
      email: "officer@appolice.local",
      passwordHash: officerPasswordHash,
      role: Role.OFFICER,
      policeUnitId: ps.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
