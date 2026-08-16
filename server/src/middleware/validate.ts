import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type Target = "body" | "query" | "params";

export function validate(schema: ZodType, target: Target = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[target]);
    if (target === "query") {
      // Express 5 exposes req.query as a read-only getter, so mutations via
      // Object.assign don't persist across property reads. Stash the coerced
      // (e.g. string -> number) result separately instead.
      (req as Request & { validatedQuery?: unknown }).validatedQuery = parsed;
    } else if (target === "params") {
      Object.assign(req.params, parsed);
    } else {
      req[target] = parsed as never;
    }
    next();
  };
}
