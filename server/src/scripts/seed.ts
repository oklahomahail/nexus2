import bcrypt from "bcryptjs";
import { prisma } from "@/config/database";
import { logger } from "@/config/logger";

async function main() {
  logger.info("🌱 Starting database seeding...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nexus.com" },
    update: {},
    create: {
      email: "admin@nexus.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    },
  });

  // Create test user
  const userPassword = await bcrypt.hash("user123!", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@nexus.com" },
    update: {},
    create: {
      email: "user@nexus.com",
      password: userPassword,
      firstName: "Test",
      lastName: "User",
      role: "USER",
    },
  });

  // Create test client
  const client = await prisma.client.upsert({
    where: { id: "test-client-id" },
    update: {},
    create: {
      id: "test-client-id",
      name: "Test Organization",
      email: "contact@testorg.com",
      phone: "+1-555-0123",
      website: "https://testorg.com",
      address: "123 Test Street, Test City, TC 12345",
      description: "A test organization for development purposes",
      userId: user.id,
    },
  });

  // Create test campaign
  const campaign = await prisma.campaign.create({
    data: {
      name: "Save the Environment Campaign",
      description: "A campaign to raise funds for environmental protection",
      type: "FUNDRAISING",
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      goalAmount: 50000.0,
      userId: user.id,
      clientId: client.id,
    },
  });

  logger.info("✅ Database seeding completed successfully!");
  logger.info(`Created admin user: ${admin.email} (password: admin123!)`);
  logger.info(`Created test user: ${user.email} (password: user123!)`);
  logger.info(`Created test client: ${client.name}`);
  logger.info(`Created test campaign: ${campaign.name}`);
}

main()
  .catch((e) => {
    logger.error("❌ Database seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
