import path from "node:path";
import { fileURLToPath } from "node:url";

import { createServer } from "./app.js";

type Arguments = {
  workspace: string;
  port: number;
  development: boolean;
};

function parseArguments(argv: string[]): Arguments {
  const workspaceIndex = argv.indexOf("--workspace");
  const portIndex = argv.indexOf("--port");
  return {
    workspace: workspaceIndex >= 0 ? (argv[workspaceIndex + 1] ?? ".") : ".",
    port: portIndex >= 0 ? Number(argv[portIndex + 1] ?? 4174) : 4174,
    development: argv.includes("--dev"),
  };
}

const isDirectExecution = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isDirectExecution) {
  const options = parseArguments(process.argv.slice(2));
  const app = await createServer({
    workspaceRoot: options.workspace,
    development: options.development,
  });
  await app.listen({ host: "127.0.0.1", port: options.port });
}

export { createServer } from "./app.js";
