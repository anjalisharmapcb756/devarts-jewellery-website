import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError.js";

export const validate = (schema: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) req.query = schema.query.parse(req.query) as any;
      if (schema.params) req.params = schema.params.parse(req.params) as any;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new ApiError(400, "Validation failed", { code: "VALIDATION_ERROR", details: err.flatten() }));
      }
      next(err);
    }
  };
