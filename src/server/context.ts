import type { FastifyInstance } from "fastify";

export type ServerContext = {
  workspaceRoot: string;
};

declare module "fastify" {
  interface FastifyInstance {
    risetra: ServerContext;
  }
}

export function attachContext(app: FastifyInstance, context: ServerContext): void {
  app.decorate("risetra", context);
}
