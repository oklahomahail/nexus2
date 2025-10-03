import { Router } from "express";
import { authenticateToken, requireRole } from "@/middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Placeholder routes - implement as needed
router.get("/", (req, res) => {
  res.json({ success: true, message: "Users endpoint - coming soon" });
});

export default router;
