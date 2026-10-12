import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyInstance } from "fastify";
import { access } from "node:fs/promises";
import path from "node:path";

import { attachContext } from "./context.js";
import { registerErrorHandler } from "./errors.js";
import { registerArtifactRoutes } from "./routes/artifacts.js";
import { registerValidationRoutes } from "./routes/validation.js";
import { registerWorkspaceRoutes } from "./routes/workspace.js";

export type CreateServerOptions = {
  workspaceRoot: string;
  webRoot?: string;
  logger?: boolean;
  development?: boolean;
};

async function directoryExists(pathname: string): Promise<boolean> {
  try {
    await access(pathname);
    return true;
  } catch {
    return false;
  }
}

export async function createServer(
  options: CreateServerOptions,
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? true,
    bodyLimit: 256 * 1024,
  });
  attachContext(app, { workspaceRoot: path.resolve(options.workspaceRoot) });
  registerErrorHandler(app);

  if (options.development) {
    await app.register(cors, {
      origin: /^http:\/\/(127\.0\.0\.1|localhost):5173$/,
      methods: ["GET", "PUT", "POST"],
    });
  }

  await registerWorkspaceRoutes(app);
  await registerArtifactRoutes(app);
  await registerValidationRoutes(app);

  if (options.webRoot && (await directoryExists(options.webRoot))) {
    await app.register(fastifyStatic, { root: path.resolve(options.webRoot) });
    app.setNotFoundHandler((request, reply) => {
      if (request.raw.url?.startsWith("/api/")) {
        return reply.status(404).send({ error: "NOT_FOUND" });
      }
      return reply.sendFile("index.html");
    });
  }

  return app;
}
