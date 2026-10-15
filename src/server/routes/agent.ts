import type { FastifyInstance } from "fastify";
import { z } from "zod";

const messageSchema = z.object({ message: z.string().min(1).max(8_000) });

export async function registerAgentRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/agent", async () => ({
    availability: await app.risetra.agent.availability(),
    state: await app.risetra.agent.state(),
  }));

  app.post("/api/agent/start", async (request, reply) => {
    const input = messageSchema.parse(request.body);
    const state = await app.risetra.agent.start(input.message);
    return reply.status(202).send({ state });
  });

  app.post("/api/agent/messages", async (request, reply) => {
    const input = messageSchema.parse(request.body);
    const state = await app.risetra.agent.start(input.message);
    return reply.status(202).send({ state });
  });

  app.post("/api/agent/stop", async () => ({
    state: await app.risetra.agent.stop(),
  }));

  app.post("/api/agent/reset", async () => ({
    state: await app.risetra.agent.reset(),
  }));
}
