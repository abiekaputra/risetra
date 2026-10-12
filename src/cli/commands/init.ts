import { Command } from "commander";

import { initializeWorkspace } from "../../core/index.js";
import { success } from "../output.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Create a traceable research proposal workspace")
    .argument("[directory]", "workspace directory", ".")
    .requiredOption("--name <name>", "proposal or working project name")
    .requiredOption("--student <name>", "student name")
    .requiredOption("--institution <name>", "institution name")
    .requiredOption("--discipline <name>", "discipline or study program")
    .requiredOption("--method <name>", "initial methodology selection")
    .option("--language <code>", "proposal language", "id-ID")
    .action(async (directory, options) => {
      const target = await initializeWorkspace({
        target: directory,
        projectName: options.name as string,
        studentName: options.student as string,
        institution: options.institution as string,
        discipline: options.discipline as string,
        methodology: options.method as string,
        proposalLanguage: options.language as string,
      });
      success(`Workspace created at ${target}`);
      console.log(`Next: risetra validate ${directory}`);
    });
}
