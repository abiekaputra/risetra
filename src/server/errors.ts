import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "The request or workspace data is invalid.",
        details: error.issues,
      });
    }

    const normalized = error instanceof Error ? error : new Error("Unexpected error.");
    const httpError = normalized as Error & { code?: string; statusCode?: number };

    if (normalized.message.includes("changed on disk")) {
      return reply.status(409).send({
        error: "VERSION_CONFLICT",
        message: normalized.message,
      });
    }

    if (
      httpError.statusCode &&
      httpError.statusCode >= 400 &&
      httpError.statusCode < 500
    ) {
      return reply.status(httpError.statusCode).send({
        error: httpError.code ?? "BAD_REQUEST",
        message: httpError.message,
      });
    }

    app.log.error(normalized);
    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: normalized.message,
    });
  });
}
