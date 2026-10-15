import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { searchLiterature } from "../../core/index.js";

const querySchema = z.object({
  q: z.string().trim().min(3).max(300),
  yearFrom: z.coerce.number().int().min(1500).max(2100).optional(),
});

export async function registerLiteratureRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/literature/search", async (request) => {
    const query = querySchema.parse(request.query);
    return { candidates: await searchLiterature(query.q, query.yearFrom) };
  });
}
