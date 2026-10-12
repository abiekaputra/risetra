import { Command } from "commander";
import path from "node:path";

import { loadWorkspace, validateWorkspace } from "../../core/index.js";
import { printValidation } from "../output.js";

export function registerValidateCommand(program: Command): void {
  program
    .command("validate")
    .description("Validate evidence, review state, and proposal alignment")
    .argument("[directory]", "workspace directory", ".")
    .option("--json", "print machine-readable JSON")
    .action(async (directory, options) => {
      const snapshot = await loadWorkspace(path.resolve(directory));
      const report = validateWorkspace(snapshot);
      if (options.json) console.log(JSON.stringify(report, null, 2));
      else printValidation(report, snapshot.config.languages.interaction);
      if (!report.valid) process.exitCode = 1;
    });
}
