import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { createServer } from "../src/server/app.js";

const servers: Awaited<ReturnType<typeof createServer>>[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
});

describe("local API", () => {
  it("reports health without exposing the filesystem", async () => {
    const app = await createServer({
      workspaceRoot: path.resolve("examples/demo"),
      logger: false,
    });
    servers.push(app);
    const response = await app.inject({ method: "GET", url: "/api/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok", product: "Risetra" });
  });

  it("returns the validated workspace summary", async () => {
    const app = await createServer({
      workspaceRoot: path.resolve("examples/demo"),
      logger: false,
    });
    servers.push(app);
    const response = await app.inject({ method: "GET", url: "/api/workspace" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.summary.total).toBe(6);
    expect(body.validation.valid).toBe(true);
  });

  it("rejects malformed artifact identifiers", async () => {
    const app = await createServer({
      workspaceRoot: path.resolve("examples/demo"),
      logger: false,
    });
    servers.push(app);
    const response = await app.inject({
      method: "GET",
      url: "/api/artifacts/../secret",
    });

    expect(response.statusCode).toBe(404);
  });

  it("preserves client error status for malformed JSON requests", async () => {
    const app = await createServer({
      workspaceRoot: path.resolve("examples/demo"),
      logger: false,
    });
    servers.push(app);
    const response = await app.inject({
      method: "POST",
      url: "/api/validate",
      headers: { "content-type": "application/json" },
      payload: "",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("FST_ERR_CTP_EMPTY_JSON_BODY");
  });
});
