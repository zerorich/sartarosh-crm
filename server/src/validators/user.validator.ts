import { z } from "zod";
import { uuidSchema } from "./common";

export const savedSalonParamSchema = z.object({
  salonId: uuidSchema,
});
