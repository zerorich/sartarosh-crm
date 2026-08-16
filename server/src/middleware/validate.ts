import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type Target = "body" | "query" | "params";

export function validate(schema: ZodType, target: Target = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[target]);
    if (target === "query") {
      Object.assign(req.query, parsed);
    } else if (target === "params") {
      Object.assign(req.params, parsed);
    } else {
      req[target] = parsed as never;
    }
    next();
  };
}
