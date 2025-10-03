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

  // Create test clients
  const client1 = await prisma.client.upsert({
    where: { id: "acme-nonprofit" },
    update: {},
    create: {
      id: "acme-nonprofit",
      name: "Acme Nonprofit",
      email: "jane@acmenonprofit.org",
      phone: "+1-555-0100",
      website: "https://acmenonprofit.org",
      address: "100 Education Blvd, Learning City, LC 10001",
      description: "Focused on education and community development",
      userId: user.id,
    },
  });

  const client2 = await prisma.client.upsert({
    where: { id: "green-future" },
    update: {},
    create: {
      id: "green-future",
      name: "Green Future Foundation",
      email: "mike@greenfuture.org",
      phone: "+1-555-0200",
      website: "https://greenfuture.org",
      address: "200 Environmental Way, Eco City, EC 20002",
      description: "Environmental conservation and sustainability projects",
      userId: user.id,
    },
  });

  const client3 = await prisma.client.upsert({
    where: { id: "community-care" },
    update: {},
    create: {
      id: "community-care",
      name: "Community Care Alliance",
      email: "sarah@communitycare.org",
      phone: "+1-555-0300",
      website: "https://communitycare.org",
      address: "300 Healthcare Ave, Wellness City, WC 30003",
      description: "Healthcare and social services for underserved communities",
      userId: user.id,
    },
  });

  // Keep original client for backward compatibility
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
  logger.info(
    `Created clients: ${client1.name}, ${client2.name}, ${client3.name}, ${client.name}`,
  );
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
