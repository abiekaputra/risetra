import { Command } from "commander";
import path from "node:path";

import { loadResearchModules, validateModuleGraph } from "../../core/index.js";
import { heading, success } from "../output.js";

export function registerModulesCommand(program: Command): void {
  program
    .command("modules")
    .description("Inspect and validate research guidance modules")
    .option("--directory <path>", "module directory", "modules")
    .action(async (options) => {
      const modules = await loadResearchModules(path.resolve(options.directory));
      const errors = validateModuleGraph(modules);
      heading(`Risetra modules · ${modules.length}`);
      const counts = modules.reduce(
        (result, module) => {
          result[module.status] += 1;
          return result;
        },
        { DRAFT: 0, REVIEWED: 0, APPROVED: 0 },
      );
      console.log(
        `${counts.APPROVED} approved · ${counts.REVIEWED} reviewed · ${counts.DRAFT} draft`,
      );
      if (errors.length > 0) {
        errors.forEach((error) => console.error(`✗ ${error}`));
        process.exitCode = 1;
        return;
      }
      success("Module metadata and dependency graph are valid.");
    });
}
