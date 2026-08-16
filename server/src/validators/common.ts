import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Invalid email address"));

export const uuidSchema = z.string().uuid();

export const dateSchema = z.coerce.date();

export const moneySchema = z.coerce.number().finite().nonnegative().max(100_000_000);

export const ratingSchema = z.coerce.number().int().min(1).max(5);

export const latSchema = z.coerce.number().min(-90).max(90);
export const lngSchema = z.coerce.number().min(-180).max(180);

export const idParamSchema = z.object({
  id: uuidSchema,
});
