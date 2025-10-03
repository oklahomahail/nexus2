import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "@/config/database";
import { AuthRequest, authenticateToken } from "@/middleware/auth";
import { asyncHandler, CustomError } from "@/middleware/errorHandler";
import { logger } from "@/config/logger";

const router = Router();
router.use(authenticateToken);

// Validation schemas
const createClientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial();

// GET /clients - List all clients for the authenticated user
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const clients = await prisma.client.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            campaigns: true,
            donors: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: { clients },
    });
  }),
);

// GET /clients/:id - Get single client
router.get(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const client = await prisma.client.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
            goalAmount: true,
            raisedAmount: true,
          },
        },
        donors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            totalDonated: true,
          },
          take: 10,
          orderBy: { totalDonated: "desc" },
        },
        _count: {
          select: {
            campaigns: true,
            donors: true,
          },
        },
      },
    });

    if (!client) {
      throw new CustomError("Client not found", 404);
    }

    res.json({
      success: true,
      data: { client },
    });
  }),
);

// POST /clients - Create new client
router.post(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const validatedData = createClientSchema.parse(req.body);

    const client = await prisma.client.create({
      data: {
        ...validatedData,
        userId,
      },
      include: {
        _count: {
          select: {
            campaigns: true,
            donors: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "CLIENT_CREATED",
        description: `Client "${client.name}" created`,
        userId,
        metadata: { clientId: client.id },
      },
    });

    logger.info("Client created", { clientId: client.id, userId });

    res.status(201).json({
      success: true,
      data: { client },
      message: "Client created successfully",
    });
  }),
);

// PUT /clients/:id - Update client
router.put(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const validatedData = updateClientSchema.parse(req.body);

    // Verify client ownership
    const existingClient = await prisma.client.findFirst({
      where: { id, userId },
    });

    if (!existingClient) {
      throw new CustomError("Client not found", 404);
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            campaigns: true,
            donors: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "CLIENT_UPDATED",
        description: `Client "${client.name}" updated`,
        userId,
        metadata: {
          clientId: client.id,
          updatedFields: Object.keys(validatedData),
        },
      },
    });

    logger.info("Client updated", { clientId: client.id, userId });

    res.json({
      success: true,
      data: { client },
      message: "Client updated successfully",
    });
  }),
);

// DELETE /clients/:id - Delete client (soft delete)
router.delete(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify client ownership
    const existingClient = await prisma.client.findFirst({
      where: { id, userId },
    });

    if (!existingClient) {
      throw new CustomError("Client not found", 404);
    }

    // Check if client has active campaigns
    const activeCampaigns = await prisma.campaign.count({
      where: {
        clientId: id,
        status: "ACTIVE",
      },
    });

    if (activeCampaigns > 0) {
      throw new CustomError(
        "Cannot delete client with active campaigns. Please complete or cancel active campaigns first.",
        400,
      );
    }

    // Soft delete - mark as inactive
    await prisma.client.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "CLIENT_UPDATED",
        description: `Client "${existingClient.name}" deleted`,
        userId,
        metadata: { clientId: id },
      },
    });

    logger.info("Client deleted", { clientId: id, userId });

    res.json({
      success: true,
      message: "Client deleted successfully",
    });
  }),
);

export default router;
