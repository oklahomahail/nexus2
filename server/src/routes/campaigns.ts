import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "@/config/database";
import { AuthRequest, authenticateToken, requireRole } from "@/middleware/auth";
import { asyncHandler, CustomError } from "@/middleware/errorHandler";
import { logger } from "@/config/logger";

const router = Router();
router.use(authenticateToken);

// Validation schemas
const createCampaignSchema = z
  .object({
    name: z.string().min(1, "Campaign name is required"),
    description: z.string().optional(),
    type: z
      .enum(["FUNDRAISING", "AWARENESS", "EVENT", "MEMBERSHIP"])
      .default("FUNDRAISING"),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    goalAmount: z.number().positive().optional(),
    clientId: z.string().min(1, "Client ID is required"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

const updateCampaignSchema = createCampaignSchema.partial();

const querySchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
  status: z
    .enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"])
    .optional(),
  type: z.enum(["FUNDRAISING", "AWARENESS", "EVENT", "MEMBERSHIP"]).optional(),
  clientId: z.string().optional(),
});

// Helper function to check campaign access
async function checkCampaignAccess(
  campaignId: string,
  userId: string,
  requireOwner = false,
) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { client: true },
  });

  if (!campaign) {
    throw new CustomError("Campaign not found", 404);
  }

  if (requireOwner && campaign.userId !== userId) {
    throw new CustomError("Access denied", 403);
  }

  return campaign;
}

// GET /campaigns - List campaigns with filtering and pagination
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, status, type, clientId } = querySchema.parse(
      req.query,
    );
    const userId = req.user!.id;

    const skip = (page - 1) * limit;
    const where: any = { userId };

    if (status) where.status = status;
    if (type) where.type = type;
    if (clientId) where.clientId = clientId;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true },
          },
          _count: {
            select: { donations: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  }),
);

// GET /campaigns/:id - Get single campaign
router.get(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const campaign = await checkCampaignAccess(id, userId);

    const campaignWithDetails = await prisma.campaign.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        donations: {
          include: {
            donor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { donatedAt: "desc" },
          take: 10,
        },
        analytics: {
          orderBy: { date: "desc" },
          take: 30,
        },
        _count: {
          select: { donations: true },
        },
      },
    });

    res.json({
      success: true,
      data: { campaign: campaignWithDetails },
    });
  }),
);

// POST /campaigns - Create new campaign
router.post(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const validatedData = createCampaignSchema.parse(req.body);

    // Verify client ownership
    const client = await prisma.client.findFirst({
      where: {
        id: validatedData.clientId,
        userId,
      },
    });

    if (!client) {
      throw new CustomError("Client not found or access denied", 404);
    }

    const campaign = await prisma.campaign.create({
      data: {
        ...validatedData,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        userId,
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "CAMPAIGN_CREATED",
        description: `Campaign "${campaign.name}" created`,
        userId,
        campaignId: campaign.id,
        metadata: { campaignType: campaign.type },
      },
    });

    logger.info("Campaign created", { campaignId: campaign.id, userId });

    res.status(201).json({
      success: true,
      data: { campaign },
      message: "Campaign created successfully",
    });
  }),
);

// PUT /campaigns/:id - Update campaign
router.put(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const validatedData = updateCampaignSchema.parse(req.body);

    await checkCampaignAccess(id, userId, true);

    // If clientId is being updated, verify new client ownership
    if (validatedData.clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: validatedData.clientId,
          userId,
        },
      });

      if (!client) {
        throw new CustomError("Client not found or access denied", 404);
      }
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...validatedData,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : undefined,
        endDate: validatedData.endDate
          ? new Date(validatedData.endDate)
          : undefined,
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "CAMPAIGN_UPDATED",
        description: `Campaign "${campaign.name}" updated`,
        userId,
        campaignId: campaign.id,
        metadata: { updatedFields: Object.keys(validatedData) },
      },
    });

    logger.info("Campaign updated", { campaignId: campaign.id, userId });

    res.json({
      success: true,
      data: { campaign },
      message: "Campaign updated successfully",
    });
  }),
);

// DELETE /campaigns/:id - Delete campaign
router.delete(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const campaign = await checkCampaignAccess(id, userId, true);

    // Soft delete - mark as inactive instead of hard delete
    await prisma.campaign.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "CAMPAIGN_DELETED",
        description: `Campaign "${campaign.name}" deleted`,
        userId,
        campaignId: id,
      },
    });

    logger.info("Campaign deleted", { campaignId: id, userId });

    res.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  }),
);

// GET /campaigns/:id/analytics - Get campaign analytics
router.get(
  "/:id/analytics",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    await checkCampaignAccess(id, userId);

    const analytics = await prisma.campaignAnalytics.findMany({
      where: { campaignId: id },
      orderBy: { date: "desc" },
      take: 90, // Last 90 days
    });

    // Get donation statistics
    const donationStats = await prisma.donation.aggregate({
      where: {
        campaignId: id,
        status: "COMPLETED",
      },
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true },
    });

    res.json({
      success: true,
      data: {
        analytics,
        donationStats: {
          totalAmount: donationStats._sum.amount || 0,
          totalDonations: donationStats._count.id || 0,
          averageDonation: donationStats._avg.amount || 0,
        },
      },
    });
  }),
);

export default router;
