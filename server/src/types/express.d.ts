import type { AuthRequestUser } from "./index";

declare global {
  namespace Express {
    interface Request {
      user?: AuthRequestUser;
    }
  }
}

export {};
