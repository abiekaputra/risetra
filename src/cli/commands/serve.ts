import { Command } from "commander";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createServer } from "../../server/app.js";
import { heading, success } from "../output.js";

function findWebRoot(): string {
  const current = path.dirname(fileURLToPath(import.meta.url));
  const packagedRoot = path.resolve(current, "..", "..", "..", "web", "dist");
  const repositoryRoot = path.resolve(process.cwd(), "web", "dist");
  return (
    process.env.RISETRA_WEB_ROOT ??
    (process.cwd().endsWith("risetra") ? repositoryRoot : packagedRoot)
  );
}

export function registerServeCommand(program: Command): void {
  program
    .command("serve")
    .description("Open the local review dashboard and workspace API")
    .argument("[directory]", "workspace directory", ".")
    .option("--port <number>", "local server port", "4173")
    .action(async (directory, options) => {
      const port = Number(options.port);
      if (!Number.isInteger(port) || port < 1024 || port > 65535) {
        throw new Error("Port must be an integer between 1024 and 65535.");
      }
      const app = await createServer({
        workspaceRoot: path.resolve(directory),
        webRoot: findWebRoot(),
      });
      await app.listen({ host: "127.0.0.1", port });
      heading("Risetra is ready");
      success(`Dashboard: http://127.0.0.1:${port}`);
      console.log("Press Ctrl+C to stop the local server.");
    });
}
