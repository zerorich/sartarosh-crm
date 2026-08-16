import { z } from "zod";
import { dateSchema, uuidSchema } from "./common";

export const availabilityQuerySchema = z.object({
  salonId: uuidSchema,
  barberId: uuidSchema,
  serviceId: uuidSchema,
  date: dateSchema,
});
