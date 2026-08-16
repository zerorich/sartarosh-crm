import { randomUUID } from "node:crypto";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/authenticate";
import { AppError } from "../utils/app-error";
import { ok } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { env } from "../config/env";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error("Unsupported image type"));
      return;
    }
    cb(null, true);
  },
});

export const uploadsRouter = Router();

/**
 * @openapi
 * /api/uploads/image:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload an image (e.g. profile avatar) and get back its public URL
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
uploadsRouter.post(
  "/image",
  authenticate,
  (req, res, next) => {
    upload.single("file")(req, res, (err: unknown) => {
      if (err) {
        next(AppError.badRequest(err instanceof Error ? err.message : "Upload failed"));
        return;
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw AppError.badRequest("No file uploaded");
    }
    const url = `${env.PUBLIC_URL}/uploads/${req.file.filename}`;
    return ok(res, { url }, 201);
  }),
);
